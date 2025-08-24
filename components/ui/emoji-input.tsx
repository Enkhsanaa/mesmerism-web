"use client";

import { cn } from "@/lib/utils";
import { renderMessageWithEmojis } from "@/lib/emoji-renderer";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  useCallback,
} from "react";

// Debounce utility function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

export interface EmojiInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLDivElement>,
    "onChange" | "value" | "children"
  > {
  value: string;
  onChange: (value: string) => void;
}

const EmojiInput = forwardRef<HTMLDivElement, EmojiInputProps>(
  (
    { className, value, onChange, onKeyDown, disabled, placeholder, ...props },
    ref
  ) => {
    const editableRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => editableRef.current!, []);

    // Helper function to get absolute cursor position in text
    const getAbsoluteCursorPosition = useCallback(
      (container: HTMLElement, range: Range): number => {
        let textOffset = 0;
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null
        );

        let node;
        while ((node = walker.nextNode())) {
          if (node === range.startContainer) {
            return textOffset + range.startOffset;
          }

          if (node.nodeType === Node.TEXT_NODE) {
            textOffset += node.textContent?.length || 0;
          } else if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node as HTMLElement).tagName === "IMG"
          ) {
            // Count emoji as the length of its alt text
            const alt = (node as HTMLImageElement).alt || "";
            textOffset += alt.length;
          }
        }

        return textOffset;
      },
      []
    );

    // Helper function to restore cursor position based on text offset
    const restoreCursorPosition = useCallback(
      (container: HTMLElement, text: string, targetOffset: number) => {
        const selection = window.getSelection();
        if (!selection) return;

        let currentOffset = 0;
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null
        );

        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeType === Node.TEXT_NODE) {
            const textLength = node.textContent?.length || 0;
            if (currentOffset + textLength >= targetOffset) {
              // Cursor is within this text node
              const range = document.createRange();
              range.setStart(
                node,
                Math.min(targetOffset - currentOffset, textLength)
              );
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
              return;
            }
            currentOffset += textLength;
          } else if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node as HTMLElement).tagName === "IMG"
          ) {
            const alt = (node as HTMLImageElement).alt || "";
            const emojiLength = alt.length;

            if (currentOffset + emojiLength >= targetOffset) {
              // Cursor should be after this emoji
              const range = document.createRange();
              range.setStartAfter(node);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
              return;
            }
            currentOffset += emojiLength;
          }
        }

        // Fallback: place cursor at end
        const range = document.createRange();
        range.selectNodeContents(container);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      },
      []
    );

    // Update the content when value prop changes or when we need to render emojis
    const updateContent = useCallback(
      (text: string, maintainCursor = false) => {
        if (!editableRef.current) return;

        let cursorPosition = 0;
        if (maintainCursor) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // Calculate the absolute text position in the original content
            cursorPosition = getAbsoluteCursorPosition(
              editableRef.current,
              range
            );
          }
        }

        const renderedContent = renderMessageWithEmojis(text);
        editableRef.current.innerHTML = "";

        renderedContent.forEach((part) => {
          if (typeof part === "string") {
            editableRef.current!.appendChild(document.createTextNode(part));
          } else {
            // Handle React element (emoji image)
            const reactElement = part as React.ReactElement<{
              src: string;
              alt: string;
              title: string;
              className: string;
              loading: string;
            }>;

            const img = document.createElement("img");
            img.src = reactElement.props.src;
            img.alt = reactElement.props.alt;
            img.title = reactElement.props.title;
            img.className =
              "inline-block w-5 h-5 object-contain mx-0.5 align-text-bottom";
            img.loading = "lazy";

            editableRef.current!.appendChild(img);
          }
        });

        // Restore cursor position if needed (only when emojis are actually rendered)
        if (maintainCursor) {
          const hasEmojis = renderedContent.some(
            (part) => typeof part !== "string"
          );
          if (hasEmojis) {
            setTimeout(() => {
              restoreCursorPosition(editableRef.current!, text, cursorPosition);
            }, 0);
          }
        }
      },
      [getAbsoluteCursorPosition, restoreCursorPosition]
    );

    // Update content when value prop changes from outside
    useEffect(() => {
      if (editableRef.current) {
        // Always update if the value is empty (for clearing after submission)
        if (value === "") {
          editableRef.current.innerHTML = "";
          return;
        }

        // Only update content if not currently focused (to avoid interfering with typing)
        if (editableRef.current !== document.activeElement) {
          updateContent(value);
        }
      }
    }, [value, updateContent]);

    const extractTextFromElement = useCallback(
      (element: HTMLElement): string => {
        let text = "";
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent || "";
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === "IMG") {
              // Convert emoji images back to text format
              const alt = el.getAttribute("alt") || "";
              text += alt;
            } else {
              text += extractTextFromElement(el);
            }
          }
        }
        return text;
      },
      []
    );

    // Debounced emoji rendering to avoid lag during fast typing
    const debouncedEmojiRender = useDebounce((text: string) => {
      if (
        editableRef.current &&
        editableRef.current === document.activeElement
      ) {
        updateContent(text, true);
      }
    }, 150); // 150ms debounce

    const handleInput = useCallback(() => {
      if (editableRef.current) {
        const newText = extractTextFromElement(editableRef.current);
        if (newText !== value) {
          onChange(newText);

          // Only render emojis if the text contains emoji patterns
          const hasEmojiPattern = /:[\w]+:/.test(newText);
          if (hasEmojiPattern) {
            debouncedEmojiRender(newText);
          }
        }
      }
    }, [extractTextFromElement, onChange, value, debouncedEmojiRender]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        setIsFocused(true);

        // Ensure cursor is positioned correctly when focusing empty input
        if (!value && editableRef.current) {
          setTimeout(() => {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editableRef.current!);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }, 0);
        }

        props.onFocus?.(e);
      },
      [props, value]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        setIsFocused(false);
        props.onBlur?.(e);
      },
      [props]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Handle Enter key - prevent line breaks but allow parent handler to run
        if (e.key === "Enter") {
          e.preventDefault();
          // Call the parent's onKeyDown handler first (for form submission)
          onKeyDown?.(e);
          return;
        }

        // Immediately render emojis when user types colon (end of emoji)
        if (e.key === ":" && editableRef.current) {
          setTimeout(() => {
            const newText = extractTextFromElement(editableRef.current!);
            const hasCompleteEmoji = /:[\w]+:/.test(newText);
            if (hasCompleteEmoji) {
              updateContent(newText, true);
            }
          }, 50);
        }

        onKeyDown?.(e);
      },
      [onKeyDown, extractTextFromElement, updateContent]
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");

        // Insert text at cursor position
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        handleInput();
      },
      [handleInput]
    );

    // Show placeholder when empty
    const showPlaceholder = !value && placeholder;

    return (
      <div
        {...props}
        ref={editableRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          "flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[2.5rem] flex items-center flex-wrap",
          // Show placeholder when empty (whether focused or not)
          showPlaceholder &&
            "before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        data-placeholder={showPlaceholder ? placeholder : " "}
        style={{
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          ...props.style,
        }}
        suppressContentEditableWarning={true}
      >
        <span></span>
      </div>
    );
  }
);

EmojiInput.displayName = "EmojiInput";

export { EmojiInput };

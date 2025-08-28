"use client";

import { CUSTOM_EMOJIS } from "@/lib/emoji-renderer";
import { useCallback, useEffect, useRef } from "react";

interface EmojiPickerProps {
  isOpen: boolean;
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤐",
];

export const EmojiPicker = ({
  isOpen,
  onEmojiSelect,
  onClose,
}: EmojiPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onEmojiSelect(emoji);
      onClose();
    },
    [onEmojiSelect, onClose]
  );

  const handleCustomEmojiClick = useCallback(
    (customEmoji: any) => {
      // For custom emojis, we'll use a special format that can be parsed later
      onEmojiSelect(`:${customEmoji.name}:`);
      onClose();
    },
    [onEmojiSelect, onClose]
  );

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-4 mb-2 bg-popover border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-80"
    >
      <div className="p-3 max-h-60 overflow-y-auto space-y-4">
        {/* Custom Emojis Section */}
        {CUSTOM_EMOJIS.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Frequently Used
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {CUSTOM_EMOJIS.map((customEmoji) => (
                <button
                  key={customEmoji.name}
                  type="button"
                  className="hover:bg-accent rounded p-1.5 transition-colors flex items-center justify-center"
                  onClick={() => handleCustomEmojiClick(customEmoji)}
                  title={customEmoji.name}
                >
                  <img
                    src={customEmoji.url}
                    alt={customEmoji.name}
                    className="w-5 h-5 object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Standard Emojis Section */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
            Smileys & People
          </h3>
          <div className="grid grid-cols-8 gap-2 text-lg">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

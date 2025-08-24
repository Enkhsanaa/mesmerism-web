"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
  /** Threshold in pixels to consider "at bottom" */
  bottomThreshold?: number;
  /** Threshold in pixels to consider "at top" */
  topThreshold?: number;
  /** Debounce delay for scroll events in ms */
  scrollDebounce?: number;
  /** Initial load protection time in ms */
  initialLoadTime?: number;
  /** Auto-scroll delay for regular messages in ms */
  scrollDelay?: number;
  /** Auto-scroll delay for bulk loads in ms */
  bulkScrollDelay?: number;
}

interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether auto-scroll is currently enabled */
  isAutoScrollEnabled: boolean;
  /** Whether to show the scroll-to-bottom button */
  showScrollToBottom: boolean;
  /** Whether user is near the top (for load more button) */
  isNearTop: boolean;
  /** Function to scroll to bottom */
  scrollToBottom: () => void;
  /** Function to manually enable auto-scroll */
  enableAutoScroll: () => void;
  /** Function to manually disable auto-scroll */
  disableAutoScroll: () => void;
}

export function useAutoScroll(
  dependencies: unknown[] = [],
  options: UseAutoScrollOptions = {}
): UseAutoScrollReturn {
  const {
    bottomThreshold = 30,
    topThreshold = 50,
    scrollDebounce = 150,
    initialLoadTime = 1000,
    scrollDelay = 100,
    bulkScrollDelay = 200,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);

  // Internal refs for managing scroll behavior
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticScroll = useRef(false);
  const isInitialLoad = useRef(true);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, []);

  // Manual control functions
  const enableAutoScroll = useCallback(() => {
    setIsAutoScrollEnabled(true);
    isProgrammaticScroll.current = true;
    scrollToBottom();
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 50);
  }, [scrollToBottom]);

  const disableAutoScroll = useCallback(() => {
    setIsAutoScrollEnabled(false);
  }, []);

  // Mark initial load as complete after first render
  useEffect(() => {
    if (dependencies.length > 0) {
      const timer = setTimeout(() => {
        isInitialLoad.current = false;
      }, initialLoadTime);
      return () => clearTimeout(timer);
    }
  }, [dependencies.length, initialLoadTime]);

  // Handle scroll events to detect manual scrolling (debounced)
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isProgrammaticScroll.current) return;

    // Clear existing debounce timeout
    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
    }

    // Debounce scroll handling to avoid conflicts during rapid updates
    scrollDebounceRef.current = setTimeout(() => {
      if (!containerRef.current || isProgrammaticScroll.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollBottom = scrollHeight - clientHeight;
      const isAtBottom = scrollTop >= scrollBottom - bottomThreshold;
      const isAtTop = scrollTop <= topThreshold;

      // Update states based on scroll position
      setIsNearTop(isAtTop);
      setShowScrollToBottom(!isAtBottom);

      // Don't disable auto-scroll during initial load or rapid message updates
      if (!isInitialLoad.current) {
        // If user manually scrolls away from bottom, disable auto-scroll
        if (!isAtBottom && isAutoScrollEnabled) {
          console.log("Auto-scroll disabled - user scrolled away from bottom");
          setIsAutoScrollEnabled(false);
        }

        // If user manually scrolls to bottom, re-enable auto-scroll
        if (isAtBottom && !isAutoScrollEnabled) {
          console.log("Auto-scroll re-enabled - user scrolled to bottom");
          setIsAutoScrollEnabled(true);
        }
      }
    }, scrollDebounce);
  }, [isAutoScrollEnabled, bottomThreshold, topThreshold, scrollDebounce]);

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Auto-scroll when enabled and dependencies change
  useEffect(() => {
    if (isAutoScrollEnabled) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Longer delay for bulk loads, shorter for individual messages
      const delay = isInitialLoad.current ? bulkScrollDelay : scrollDelay;

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = true;
        scrollToBottom();
        // Reset flag after scroll completes with longer delay during bulk operations
        setTimeout(
          () => {
            isProgrammaticScroll.current = false;
          },
          isInitialLoad.current ? bulkScrollDelay : scrollDelay
        );
      }, delay);
    }
  }, [
    ...dependencies,
    isAutoScrollEnabled,
    scrollToBottom,
    scrollDelay,
    bulkScrollDelay,
  ]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    isAutoScrollEnabled,
    showScrollToBottom,
    isNearTop,
    scrollToBottom,
    enableAutoScroll,
    disableAutoScroll,
  };
}

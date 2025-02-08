import { useEffect, useRef, useState } from "react";
import * as React from "react";

// How many pixels from the bottom of the container to enable auto-scroll
const ACTIVATION_THRESHOLD = 50;

export function useAutoScroll(dependencies: React.DependencyList) {
  const containerReference = useRef<HTMLDivElement | null>(null);
  const previousScrollTop = useRef<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (containerReference.current) {
      containerReference.current.scrollTop =
        containerReference.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (containerReference.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        containerReference.current;

      const isScrollingUp = previousScrollTop.current
        ? scrollTop < previousScrollTop.current
        : false;

      if (isScrollingUp) {
        setShouldAutoScroll(false);
      } else {
        const isScrolledToBottom =
          Math.abs(scrollHeight - scrollTop - clientHeight) <
          ACTIVATION_THRESHOLD;

        setShouldAutoScroll(isScrolledToBottom);
      }

      previousScrollTop.current = scrollTop;
    }
  };

  const handleTouchStart = () => {
    setShouldAutoScroll(false);
  };

  useEffect(() => {
    if (containerReference.current) {
      previousScrollTop.current = containerReference.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, dependencies);

  return {
    containerRef: containerReference,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  };
}

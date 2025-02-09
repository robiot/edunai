/* eslint-disable unicorn/consistent-destructuring */
import { useLayoutEffect, useRef } from "react";
import * as React from "react";

interface UseAutosizeTextAreaProperties {
  ref: React.RefObject<HTMLTextAreaElement>;
  maxHeight?: number;
  borderWidth?: number;
  dependencies: React.DependencyList;
}

export function useAutosizeTextArea({
  ref,
  maxHeight = Number.MAX_SAFE_INTEGER,
  borderWidth = 0,
  dependencies,
}: UseAutosizeTextAreaProperties) {
  const originalHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const currentReference = ref.current;
    const borderAdjustment = borderWidth * 2;

    if (originalHeight.current === null) {
      originalHeight.current = currentReference.scrollHeight - borderAdjustment;
    }

    currentReference.style.removeProperty("height");
    const { scrollHeight } = currentReference;

    // Make sure we don't go over maxHeight
    const clampedToMax = Math.min(scrollHeight, maxHeight);
    // Make sure we don't go less than the original height
    const clampedToMin = Math.max(clampedToMax, originalHeight.current);

    currentReference.style.height = `${clampedToMin + borderAdjustment}px`;
  }, [maxHeight, ref, ...dependencies]);
}

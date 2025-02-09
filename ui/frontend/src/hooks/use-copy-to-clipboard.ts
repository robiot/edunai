/* eslint-disable no-undef */
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type UseCopyToClipboardProperties = {
  text: string;
  copyMessage?: string;
};

export function useCopyToClipboard({
  text,
  copyMessage = "Copied to clipboard!",
}: UseCopyToClipboardProperties) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutReference = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(copyMessage);
        setIsCopied(true);

        if (timeoutReference.current) {
          clearTimeout(timeoutReference.current);
          timeoutReference.current = null;
        }

        timeoutReference.current = setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to copy clipboard.");
      });
  }, [text, copyMessage]);

  return { isCopied, handleCopy };
}

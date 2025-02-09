/* eslint-disable unicorn/prevent-abbreviations */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { omit } from "remeda";

import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea";
import { cn } from "@/lib/utils";

interface MessageInputBaseProperties
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  submitOnEnter?: boolean;
  stop?: () => void;
  isGenerating: boolean;
  enableInterrupt?: boolean;
}

interface MessageInputWithoutAttachmentProperties
  extends MessageInputBaseProperties {
  allowAttachments?: false;
}

interface MessageInputWithAttachmentsProperties
  extends MessageInputBaseProperties {
  allowAttachments: true;
  files: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
}

type MessageInputProperties =
  | MessageInputWithoutAttachmentProperties
  | MessageInputWithAttachmentsProperties;

export function MessageInput({
  placeholder = "Ask AI...",
  className,
  onKeyDown: onKeyDownProperty,
  submitOnEnter = true,
  stop,
  isGenerating,
  enableInterrupt = true,
  ...properties
}: MessageInputProperties) {
  const [isDragging, setIsDragging] = useState(false);
  const [showInterruptPrompt, setShowInterruptPrompt] = useState(false);

  useEffect(() => {
    if (!isGenerating) {
      setShowInterruptPrompt(false);
    }
  }, [isGenerating]);

  const addFiles = (files: File[] | null) => {
    if (properties.allowAttachments) {
      properties.setFiles((currentFiles) => {
        if (currentFiles === null) {
          return files;
        }

        if (files === null) {
          return currentFiles;
        }

        return [...currentFiles, ...files];
      });
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    if (properties.allowAttachments !== true) return;

    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (properties.allowAttachments !== true) return;

    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    setIsDragging(false);

    if (properties.allowAttachments !== true) return;

    event.preventDefault();
    const { dataTransfer } = event;

    if (dataTransfer.files.length > 0) {
      addFiles(Array.from(dataTransfer.files));
    }
  };

  const onPaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;

    if (!items) return;

    const text = event.clipboardData.getData("text");

    if (text && text.length > 500 && properties.allowAttachments) {
      event.preventDefault();
      const blob = new Blob([text], { type: "text/plain" });
      const file = new File([blob], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now(),
      });

      addFiles([file]);

      return;
    }

    const files = Array.from(items)
      .map((item) => item.getAsFile())
      .filter((file) => file !== null);

    if (properties.allowAttachments && files.length > 0) {
      addFiles(files);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (isGenerating && stop && enableInterrupt) {
        if (showInterruptPrompt) {
          stop();
          setShowInterruptPrompt(false);
          event.currentTarget.form?.requestSubmit();
        } else if (
          properties.value ||
          (properties.allowAttachments && properties.files?.length)
        ) {
          setShowInterruptPrompt(true);

          return;
        }
      }

      event.currentTarget.form?.requestSubmit();
    }

    onKeyDownProperty?.(event);
  };

  const textAreaReference = useRef<HTMLTextAreaElement | null>(null);

  const showFileList =
    properties.allowAttachments &&
    properties.files &&
    properties.files.length > 0;

  useAutosizeTextArea({
    ref: textAreaReference,
    maxHeight: 240,
    borderWidth: 1,
    dependencies: [properties.value, showFileList],
  });

  return (
    <div className="relative flex w-full">
      {enableInterrupt && (
        <InterruptPrompt
          isOpen={showInterruptPrompt}
          close={() => setShowInterruptPrompt(false)}
        />
      )}

      <textarea
        aria-label="Write your prompt here"
        placeholder={placeholder}
        ref={textAreaReference}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        className={cn(
          "z-10 w-full grow resize-none border-0 p-4 pr-24 min-h-[60px] ring-offset-white transition-[border] placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400",
          showFileList && "pb-16",
          className,
        )}
        {...(properties.allowAttachments
          ? omit(properties, ["allowAttachments", "files", "setFiles"])
          : omit(properties, ["allowAttachments"]))}
      />

      {properties.allowAttachments && (
        <div className="absolute inset-x-3 bottom-0 z-20 overflow-x-scroll py-3">
          <div className="flex space-x-3">
            <AnimatePresence mode="popLayout">
              {properties.files?.map((file) => {
                return (
                  <FilePreview
                    key={file.name + String(file.lastModified)}
                    file={file}
                    onRemove={() => {
                      properties.setFiles((files) => {
                        if (!files) return null;

                        const filtered = Array.from(files).filter(
                          (f) => f !== file,
                        );

                        if (filtered.length === 0) return null;

                        return filtered;
                      });
                    }}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex gap-2">
        {properties.allowAttachments && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Attach a file"
            onClick={async () => {
              const files = await showFileUploadDialog();

              addFiles(files);
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}
        {isGenerating && stop ? (
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            aria-label="Stop generating"
            onClick={stop}
          >
            <Square className="h-3 w-3 animate-pulse" fill="currentColor" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 transition-opacity"
            aria-label="Send message"
            disabled={properties.value === "" || isGenerating}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>

      {properties.allowAttachments && (
        <FileUploadOverlay isDragging={isDragging} />
      )}
    </div>
  );
}
MessageInput.displayName = "MessageInput";

interface InterruptPromptProperties {
  isOpen: boolean;
  close: () => void;
}

function InterruptPrompt({ isOpen, close }: InterruptPromptProperties) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ top: 0, filter: "blur(5px)" }}
          animate={{
            top: -40,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              filter: { type: "tween" },
            },
          }}
          exit={{ top: 0, filter: "blur(5px)" }}
          className="absolute left-1/2 flex -translate-x-1/2 overflow-hidden whitespace-nowrap rounded-full border border-neutral-200 bg-white py-1 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
        >
          <span className="ml-2.5">Press Enter again to interrupt</span>
          <button
            className="ml-1 mr-2.5 flex items-center"
            type="button"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FileUploadOverlayProperties {
  isDragging: boolean;
}

function FileUploadOverlay({ isDragging }: FileUploadOverlayProperties) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-neutral-200 border-dashed bg-white text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          <Paperclip className="h-4 w-4" />
          <span>Drop your files here to attach them.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function showFileUploadDialog() {
  const input = document.createElement("input");

  input.type = "file";
  input.multiple = true;
  input.accept = "*/*";
  input.click();

  return new Promise<File[] | null>((resolve) => {
    input.addEventListener("change", (e) => {
      const { files } = e.currentTarget as HTMLInputElement;

      if (files) {
        resolve(Array.from(files));

        return;
      }

      resolve(null);
    });
  });
}

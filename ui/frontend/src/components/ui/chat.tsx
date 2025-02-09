/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { Message } from "ai";
import { ArrowDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { type ReactElement, forwardRef, useCallback, useState } from "react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { MessageInput } from "@/components/ui/message-input";
import { MessageList } from "@/components/ui/message-list";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { cn } from "@/lib/utils";

interface ChatPropertiesBase {
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList },
  ) => void;
  messages: Array<
    Message & {
      toolInvocations?: {
        state: "result" | "call";
        toolName: string;
        result?: any;
        success?: boolean;
        error?: string;
      }[];
    }
  >;
  input: string;
  className?: string;
  handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  isGenerating: boolean;
  stop?: () => void;
  onRateResponse?: (
    messageId: string,
    rating: "thumbs-up" | "thumbs-down",
  ) => void;
}

interface ChatPropertiesWithoutSuggestions extends ChatPropertiesBase {
  append?: never;
  suggestions?: never;
}

interface ChatPropertiesWithSuggestions extends ChatPropertiesBase {
  append: (message: { role: "user"; content: string }) => void;
  suggestions: string[];
}

type ChatProperties =
  | ChatPropertiesWithoutSuggestions
  | ChatPropertiesWithSuggestions;

export function Chat({
  messages,
  handleSubmit,
  input,
  handleInputChange,
  stop,
  isGenerating,
  append,
  suggestions,
  className,
  onRateResponse,
}: ChatProperties) {
  const lastMessage = messages.at(-1);
  const isEmpty = messages.length === 0;
  const isTyping = lastMessage?.role === "user";

  const messageOptions = useCallback(
    (message: Message) => ({
      actions: onRateResponse ? (
        <>
          <div className="border-r pr-1">
            <CopyButton
              content={message.content}
              copyMessage="Copied response to clipboard!"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onRateResponse(message.id, "thumbs-up")}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onRateResponse(message.id, "thumbs-down")}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <CopyButton
          content={message.content}
          copyMessage="Copied response to clipboard!"
        />
      ),
    }),
    [onRateResponse],
  );

  return (
    <ChatContainer className={className}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {isEmpty && append && suggestions ? (
          <PromptSuggestions
            label="Try these prompts ✨"
            append={append}
            suggestions={suggestions}
          />
        ) : null}

        {messages.length > 0 ? (
          <ChatMessages messages={messages}>
            <MessageList
              messages={messages}
              isTyping={isTyping}
              messageOptions={messageOptions}
            />
          </ChatMessages>
        ) : null}
      </div>

      <ChatForm
        className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
        isPending={isGenerating || isTyping}
        handleSubmit={handleSubmit}
      >
        {({ files, setFiles }) => (
          <MessageInput
            value={input}
            onChange={handleInputChange}
            allowAttachments={false}
            stop={stop}
            isGenerating={isGenerating}
          />
        )}
      </ChatForm>
    </ChatContainer>
  );
}
Chat.displayName = "Chat";

export function ChatMessages({
  messages,
  children,
}: React.PropsWithChildren<{
  messages: Message[];
}>) {
  const {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  } = useAutoScroll([messages]);

  return (
    <div
      className="grid grid-cols-1 overflow-y-auto px-2"
      ref={containerRef}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
    >
      <div className="max-w-full [grid-column:1/1] [grid-row:1/1]">
        {children}
      </div>

      <div className="flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]">
        {!shouldAutoScroll && (
          <div className="sticky bottom-0 left-0 flex w-full justify-end">
            <Button
              onClick={scrollToBottom}
              className="h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1"
              size="icon"
              variant="ghost"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const ChatContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...properties }, reference) => {
  return (
    <div
      ref={reference}
      className={cn("flex flex-col h-full w-full", className)}
      {...properties}
    />
  );
});
ChatContainer.displayName = "ChatContainer";

interface ChatFormProperties {
  className?: string;
  isPending: boolean;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList },
  ) => void;
  children: (properties: {
    files: File[] | null;
    setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  }) => ReactElement;
}

export const ChatForm = forwardRef<HTMLFormElement, ChatFormProperties>(
  ({ children, handleSubmit, isPending, className }, reference) => {
    const [files, setFiles] = useState<File[] | null>(null);

    const onSubmit = (event: React.FormEvent) => {
      if (!files) {
        handleSubmit(event);

        return;
      }

      const fileList = createFileList(files);

      handleSubmit(event, { experimental_attachments: fileList });
      setFiles(null);
    };

    return (
      <form ref={reference} onSubmit={onSubmit} className={className}>
        {children({ files, setFiles })}
      </form>
    );
  },
);
ChatForm.displayName = "ChatForm";

function createFileList(files: File[] | FileList): FileList {
  const dataTransfer = new DataTransfer();

  for (const file of Array.from(files)) {
    dataTransfer.items.add(file);
  }

  return dataTransfer.files;
}

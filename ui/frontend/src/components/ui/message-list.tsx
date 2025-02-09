/* eslint-disable unused-imports/no-unused-vars */
import { Message } from "ai";

import {
  type ChatMessageProperties,
  // type Message,
  ChatMessage,
} from "@/components/ui/chat-message";
import { TypingIndicator } from "@/components/ui/typing-indicator";

type AdditionalMessageOptions = Omit<ChatMessageProperties, keyof Message>;

interface MessageListProperties {
  messages: Message[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions);
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProperties) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions;

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
          />
        );
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}

/* eslint-disable no-redeclare */
"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { Check, Code2, Loader2, Terminal } from "lucide-react";
import React, { useMemo } from "react";
import { useAIActions } from "@/hooks/useAIActions";
import { Message } from "ai";
import { ToolInvocation } from "@/lib/tool-invocations";

import { FilePreview } from "@/components/ui/file-preview";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm",
  {
    variants: {
      isUser: {
        true: "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 sm:max-w-[70%]",
        false:
          "bg-background text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50 sm:max-w-[90%]",
      },
      animation: {
        none: "",
        slide: "duration-300 animate-in fade-in-0",
        scale: "duration-300 animate-in fade-in-0 zoom-in-75",
        fade: "duration-500 animate-in fade-in-0",
      },
    },
    compoundVariants: [
      {
        isUser: true,
        animation: "slide",
        class: "slide-in-from-right",
      },
      {
        isUser: false,
        animation: "slide",
        class: "slide-in-from-left",
      },
      {
        isUser: true,
        animation: "scale",
        class: "origin-bottom-right",
      },
      {
        isUser: false,
        animation: "scale",
        class: "origin-bottom-left",
      },
    ],
  },
);

type Animation = VariantProps<typeof chatBubbleVariants>["animation"];

interface Attachment {
  name?: string;
  contentType?: string;
  url: string;
}

interface PartialToolCall {
  state: "partial-call";
  toolName: string;
}

interface ToolCall {
  state: "call";
  toolName: string;
}

interface ToolResult {
  state: "result";
  toolName: string;
  result: any;
  success?: boolean;
  error?: string;
}

type ToolInvocation = PartialToolCall | ToolCall | ToolResult;

export interface ChatMessageProperties extends Message {
  showTimeStamp?: boolean;
  animation?: Animation;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Formats the message content by removing tool invocations and adding their results,
 * except for "add_card" tool calls which will be handled separately.
 */
function formatMessageWithToolResults(content: string, toolInvocations?: ToolInvocation[]): string {
  // Remove all tool invocation blocks (that use the json_action tool) from the content using a regex.
  let cleanContent = content.replace(/<tool>json_action<\/tool>\s*{[\s\S]*?}\s*<\/tool>/g, '');

  // Process tool results; however, we'll filter out "add_card" results because 
  // they will be rendered as a custom like box.
  const nonAddCardToolResults = toolInvocations
    ?.filter((tool) => tool.state === "result" && tool.result?.action !== 'add_card')
    .map((tool) => {
      // Depending on the action type, generate a summary text to show.
      switch (tool.result?.action) {
        case 'create_deck_with_cards':
          return `✅ Created deck "${tool.result.deck.deck_name}" with ${tool.result.cards.length} cards`;
        case 'add_deck':
          return `✅ Created deck "${tool.result.deck_name}"`;
        case 'add_cards':
          return `✅ Added ${tool.result.cards.length} cards to deck`;
        // Do not return anything for "add_card" as it will be rendered separately.
        default:
          return null;
      }
    })
    .filter(Boolean) || [];

  // Append the non-add_card tool results to the cleaned content if any exist.
  if (nonAddCardToolResults.length) {
    cleanContent = cleanContent.trim() + '\n\n' + nonAddCardToolResults.join('\n');
  }

  return cleanContent.trim();
}

export const ChatMessage: React.FC<ChatMessageProperties> = ({
  role,
  content,
  createdAt,
  showTimeStamp = false,
  animation = "scale",
  actions,
  className,
  experimental_attachments,
  toolInvocations,
}) => {
  // Add console.log to debug
  console.log('Tool Invocations:', toolInvocations);
  
  const files = useMemo(() => {
    return experimental_attachments?.map((attachment) => {
      const dataArray = dataUrlToUint8Array(attachment.url);

      return new File([dataArray], attachment.name ?? "Unknown");
    });
  }, [experimental_attachments]);

  const addCardInvocations = useMemo(() => {
    const filtered = toolInvocations?.filter((inv) => {
      // Look for any add_card results, successful or not
      if (inv.state === "result") {
        return inv.result?.action === "add_card";
      }
      return false;
    }) || [];
    
    return filtered;
  }, [toolInvocations]);

  const formattedContent = formatMessageWithToolResults(
    content,
    toolInvocations
  );

  const isUser = role === "user";

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if the message contained a tool call by comparing original and cleaned content
  const hadToolCall = useMemo(() => {
    const cleanContent = content.replace(/<tool>json_action<\/tool>\s*{[\s\S]*?}\s*<\/tool>/g, '');
    return cleanContent !== content;
  }, [content]);

  // Get the success message based on the tool call type
  const getSuccessMessage = useMemo(() => {
    const match = content.match(/<tool>json_action<\/tool>\s*({[\s\S]*?})\s*<\/tool>/);
    if (!match) return "Action completed successfully!";
    
    try {
      const json = JSON.parse(match[1]);
      switch (json.action) {
        case 'add_card':
          return "Card added successfully!";
        case 'create_deck_with_cards':
          return "Deck and cards created successfully!";
        case 'add_deck':
          return "Deck created successfully!";
        case 'add_cards':
          return "Cards added successfully!";
        default:
          return "Action completed successfully!";
      }
    } catch {
      return "Action completed successfully!";
    }
  }, [content]);

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      {files ? (
        <div className="mb-1 flex flex-wrap gap-2">
          {files.map((file, index) => {
            return <FilePreview file={file} key={index} />;
          })}
        </div>
      ) : null}

      <div className={cn(chatBubbleVariants({ isUser, animation }), className)}>
        <div>
          <MarkdownRenderer>{formattedContent}</MarkdownRenderer>
        </div>
        {addCardInvocations.length > 0 && (
          <div className="mt-2 space-y-2">
            {addCardInvocations.map((invocation, index) => (
              <div
                key={index}
                className={cn("p-2 rounded-md", 
                  invocation.success 
                    ? "bg-green-50 border border-green-300" 
                    : "bg-red-50 border border-red-300"
                )}
              >
                <p className={cn("text-sm",
                  invocation.success ? "text-green-700" : "text-red-700"
                )}>
                  {invocation.success 
                    ? "Card created successfully" 
                    : `Failed to create card: ${invocation.error || 'Unknown error'}`
                  }
                </p>
              </div>
            ))}
          </div>
        )}
        {!isUser && hadToolCall && (
          <div className="mt-2 flex items-center justify-stretch w-full">
            <div className="rounded-md bg-green-100 px-3 py-2 flex items-center gap-2 w-full justify-center">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{getSuccessMessage}</span>
            </div>
          </div>
        )}
      </div>

      {showTimeStamp && createdAt ? (
        <time
          dateTime={createdAt.toISOString()}
          className={cn(
            "mt-1 block px-1 text-xs opacity-50",
            animation !== "none" && "duration-500 animate-in fade-in-0",
          )}
        >
          {formattedTime}
        </time>
      ) : null}
    </div>
  );
};

function dataUrlToUint8Array(data: string) {
  const base64 = data.split(",")[1];
  const buf = Buffer.from(base64, "base64");

  return new Uint8Array(buf);
}

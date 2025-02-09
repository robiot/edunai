/* eslint-disable sonarjs/no-nested-template-literals */
"use client";

import { useChat } from "ai/react";
import { useEffect } from "react";

import { Chat } from "@/components/ui/chat";
import { useAIActions } from "@/hooks/useAIActions";
import { extractToolInvocations } from "@/lib/tool-invocations";
import { cn } from "@/lib/utils";

// Update interface for the AiChat component props
interface AiChatProperties {
  deckId?: string; // Make optional since we might use the chat without a deck context
  fullHeight?: boolean;
  defaultPrompt?: string;
}

// Update the system prompt to include emoji instructions
const getSystemPrompt = (
  deckId?: string,
) => `You are an intelligent assistant designed to help manage flashcards and decks.${
  deckId ? `\nYou are currently working with deck ID: ${deckId}.` : ""
}

When performing actions, use the json_action tool with the following formats:

1. **Deck and Card Creation**:
   Use this format to create a new deck with cards:
   <tool>json_action</tool>
   {
     "action": "create_deck_with_cards",
     "deck": {
       "deck_name": "Name of the deck",
       "description": "Description of the deck",
       "emoji": "🎴"  // Always include a relevant emoji for the deck theme
     },
     "cards": [
       {
         "front_content": "Front of card 1",
         "back_content": "Back of card 1"
       },
       {
         "front_content": "Front of card 2",
         "back_content": "Back of card 2"
       }
     ]
   }
   </tool>

2. **Individual Operations**:
   - To add just a deck:
   <tool>json_action</tool>
   {
     "action": "add_deck",
     "deck_name": "Name of the deck",
     "description": "Description of the deck",
     "emoji": "📚"  // Always include a relevant emoji
   }
   </tool>

   - To add multiple cards to an existing deck:
   <tool>json_action</tool>
   {
     "action": "add_cards",
     "deck_id": "${deckId || "ID of the deck"}",
     "cards": [
       {
         "front_content": "Front of card 1",
         "back_content": "Back of card 1"
       },
       {
         "front_content": "Front of card 2",
         "back_content": "Back of card 2"
       }
     ]
   }
   </tool>

   - To add a single card to existing deck:
   <tool>json_action</tool>
   {
     "action": "add_card",
     "front_content": "Front content of the card",
     "back_content": "Back content of the card",
     "deck_id": "${deckId || "ID of the deck"}"
   }
   </tool>

3. **General Instructions**:
   - Use the json_action tool for all actions
   - Format your explanations in markdown
   - Respond in the same language as the user's message

4. **For languages using other alphabets than English**:
- Include the romanized version on the back of the card if the front is in the language's script, along with an equals followed by the translation.
- For example, if the front of the card is "你好", the back should be "Nǐ hǎo = Hello".
`;

// Update the type used in useChat
// type ExtendedMessage = Message & {
//   toolInvocations?: {
//     state: "result" | "call";
//     toolName: string;
//     result?: any;
//     success: boolean;
//     error?: string;
//   }[];
// };

export const AiChat = ({
  deckId,
  fullHeight,
  defaultPrompt,
}: AiChatProperties) => {
  const { processAIResponse, isProcessing, error } = useAIActions();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setInput,
    stop,
    isLoading: isChatLoading,
  } = useChat({
    api: "/api/chat",
    body: {
      systemPrompt: getSystemPrompt(deckId),
      currentDeckId: deckId,
    },
    onFinish: async (message) => {
      // Extract tool invocations from the message
      const toolInvocations = extractToolInvocations(message.content);

      // Process each tool invocation
      for (const invocation of toolInvocations) {
        try {
          // Process the action using useAIActions
          await processAIResponse(invocation.result);

          // Store the tool invocations in the message with success state
          message.toolInvocations = message.toolInvocations || [];
          message.toolInvocations.push({
            ...invocation,
            state: "result",
            success: true,
          } as any); // since we are using a deprecated api, we need to cast to any
        } catch (error) {
          console.error("Failed to process tool invocation:", error);
          message.toolInvocations = message.toolInvocations || [];
          message.toolInvocations.push({
            ...invocation,
            state: "result",
            success: false,

            error: (error as Error).message,
          } as any);
        }
      }
    },
  });

  useEffect(() => {
    console.log("setting rn to", defaultPrompt);
    setInput(defaultPrompt || "");
  }, [defaultPrompt]);

  return (
    <>
      {/* Show processing state or error if any */}
      {isProcessing && (
        <div className="p-2 text-sm text-blue-600">
          Processing AI response...
        </div>
      )}
      {error && (
        <div className="p-2 text-sm text-red-600">Error: {error.message}</div>
      )}

      {/* Chat section */}
      <div
        className={cn(fullHeight ? "flex h-[calc(100vh-9rem)]" : "flex w-full")}
      >
        <Chat
          {...(fullHeight
            ? {
                append,
                suggestions: ["Create card", "Explain this"],
              }
            : {
                isGenerating: isChatLoading, // gotta have smt here
              })}
          messages={messages as any}
          input={input}
          className="py-5 px-4"
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isChatLoading}
          stop={stop}
        />
      </div>
    </>
  );
};

/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-nested-template-literals */
"use client";
import { useChat } from "ai/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as  React from "react";
import { useEffect, useState } from "react";

import { Chat } from "@/components/ui/chat";
import { ChatCollapseContext } from "@/contexts/ChatCollapseContext";
import { useAIActions } from "@/hooks/useAIActions";
import { extractToolInvocations } from "@/lib/tool-invocations";
import { cn } from "@/lib/utils";

// Update interface for the AiChat component props
interface AiChatProperties {
  deckId?: string; // Make optional since we might use the chat without a deck context
  isSideChat?: boolean;
  defaultPrompt?: string;
  currentCard?: {
    card_id: number;
    front_content: string;
    back_content: string;
  };
  deckName?: string;
  deckDescription?: string;
}

// Update the system prompt to include emoji instructions and current card context
const getSystemPrompt = (
  deckId?: string,
  currentCard?: AiChatProperties["currentCard"],
  deckName?: string,
  deckDescription?: string
) => `You are an intelligent assistant designed to help manage flashcards and decks.${
  deckId
    ? `\nYou are currently working with:
       Deck ID: ${deckId}
       ${deckName ? `Deck Name: ${deckName}` : ""}
       ${deckDescription ? `Deck Description: ${deckDescription}` : ""}`
    : ""
}${
  currentCard
    ? `\nCurrently viewing card ID: ${currentCard.card_id}
       Front content: "${currentCard.front_content}"
       Back content: "${currentCard.back_content}"`
    : ""
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
   - Don't ask for clarification if the user's message is clear
   - Don't ask for the front or back of the card, since you will create the card yourself
   - You are supposed to create the card yourself, not ask for the front or back of the card
   - Give a very short explanation of the card, before creating it


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
  isSideChat,
  defaultPrompt,
  currentCard,
  deckName,
  deckDescription,
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
      systemPrompt: getSystemPrompt(
        deckId,
        currentCard,
        deckName,
        deckDescription
      ),
      currentDeckId: deckId,
      currentCard,
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
    // Only set input if defaultPrompt exists and is not empty
    if (defaultPrompt?.trim()) {
      console.log("setting input to", defaultPrompt);
      setInput(defaultPrompt);
    }
  }, [defaultPrompt, setInput]); // Added setInput to dependencies

  // Add state for collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Add handler to prevent space key from triggering collapse
  const handleCollapseClick = (event: React.MouseEvent) => {
    console.log("handleCollapseClick");
    (event.target as HTMLElement).blur();
    // Prevent event from bubbling up

    event.stopPropagation();
    setIsCollapsed(!isCollapsed);

  };

  return (
    <ChatCollapseContext.Provider value={{ isCollapsed }}>
      <>
        {/* Show processing state or error if any */}
  
        {error && !isCollapsed && (
          <div className="p-2 text-sm text-red-600">Error: {error.message}</div>
        )}

        {/* Chat section with collapse functionality */}
        <div className="flex flex-1 relative w-full h-full">
          {/* Enhanced Collapse/Expand button */}
          {isSideChat && (
            <button
              onClick={handleCollapseClick}
              className={cn(
                "absolute -right-10 top-0",
                "rounded-r",
                "p-2 h-16 flex items-center justify-center",
                "transition-colors duration-200",
                "z-50"
              )}
              aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
              tabIndex={-1}
            >
              {isCollapsed ? (
                <ChevronLeft size={24} />
              ) : (
                <ChevronRight size={24} />
              )}
            </button>
          )}
          {/* Chat content with improved transition */}
          <div
            className={cn(
              "transition-all duration-200 flex flex-col w-full",
              isSideChat ? "h-[calc(100vh-9rem)]" : "h-full",
              isCollapsed
                ? "w-0 overflow-hidden"
                : (isSideChat
                  ? "w-80"
                  : "w-full")
            )}
          >
            <Chat
              {...(isSideChat
                ? {
                    append,
                    suggestions: ["Create card", "Explain this"],
                  }
                : {
                    isGenerating: isChatLoading,
                  })}
              messages={messages as any}
              input={input}
              className="flex-1 flex flex-col px-4"
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isGenerating={isChatLoading}
              stop={stop}
            />
          </div>
        </div>
      </>
    </ChatCollapseContext.Provider>
  );
};

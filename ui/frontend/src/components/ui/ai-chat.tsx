"use client";

import { useChat } from "ai/react";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chat } from "@/components/ui/chat";
import { useAIActions } from '@/hooks/useAIActions';
import { extractToolInvocations } from '@/lib/tool-invocations';
import { Message } from 'ai';
import { ToolInvocation } from '@/lib/tool-invocations';

// Update interface for the AiChat component props
interface AiChatProps {
  deckId?: string;  // Make optional since we might use the chat without a deck context
}

// Update the system prompt to include emoji instructions
const getSystemPrompt = (deckId?: string) => `You are an intelligent assistant designed to help manage flashcards and decks.${
  deckId ? `\nYou are currently working with deck ID: ${deckId}.` : ''
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
     "deck_id": "${deckId || 'ID of the deck'}",
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
     "deck_id": "${deckId || 'ID of the deck'}"
   }
   </tool>

3. **General Instructions**:
   - Use the json_action tool for all actions
   - Format your explanations in markdown
   - Respond in the same language as the user's message`;

// Update the type used in useChat
type ExtendedMessage = Message & {
  toolInvocations?: {
    state: "result" | "call";
    toolName: string;
    result?: any;
    success: boolean;
    error?: string;
  }[];
};

export const AiChat = ({ deckId }: AiChatProps) => {
  const { processAIResponse, isProcessing, error } = useAIActions();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    isLoading: isChatLoading,
  } = useChat<ExtendedMessage>({
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
            success: true
          });
        } catch (error) {
          console.error('Failed to process tool invocation:', error);
          message.toolInvocations = message.toolInvocations || [];
          message.toolInvocations.push({
            ...invocation,
            state: "result",
            success: false,
            error: error.message
          });
        }
      }
    }
  });

  return (
    <Card className="bg-[#F3F6FA] rounded-none w-full md:max-w-72 flex-1 flex items-end justify-center flex-col">
      {/* Show processing state or error if any */}
      {isProcessing && (
        <div className="p-2 text-sm text-blue-600">Processing AI response...</div>
      )}
      {error && (
        <div className="p-2 text-sm text-red-600">Error: {error.message}</div>
      )}
      
      
      {/* Chat section */}
      <div className="flex h-[calc(100vh-9rem)]">
        <Chat
          messages={messages}
          input={input}
          className="py-5 px-4"
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isChatLoading}
          append={append}
          suggestions={["Create card", "Explain this"]}
          stop={stop}
        />
      </div>
    </Card>
  );
};

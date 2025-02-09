import { useFSRS } from '@/hooks/useFSRS';
import { JsonActionResult } from '@/lib/tool-invocations';

// Types for AI responses
interface DeckWithCards {
  deck: {
    deck_name: string;
    description?: string;
  };
  cards: {
    front_content: string;
    back_content: string;
  }[];
}

interface SingleCard {
  front_content: string;
  back_content: string;
  deck_id: string;
}

// Type guard functions to validate AI responses
const isDeckWithCards = (json: any): json is DeckWithCards => {
  return (
    json?.deck?.deck_name &&
    Array.isArray(json?.cards) &&
    json.cards.every((card: any) => card.front_content && card.back_content)
  );
};

const isSingleCard = (json: any): json is SingleCard => {
  return json?.front_content && json?.back_content && json?.deck_id;
};

export function useAIActions() {
  const { useCreateDeck, useCreateFlashcard } = useFSRS();
  const createDeck = useCreateDeck();
  const createFlashcard = useCreateFlashcard();

  /**
   * Processes AI response and executes corresponding actions
   * @param actionData - The parsed JSON action data
   */
  const processAIResponse = async (actionData: JsonActionResult) => {
    try {
      // Handle different action types
      switch (actionData.action) {
        case 'create_deck_with_cards':
          if (isDeckWithCards(actionData)) {
            // Create deck and cards implementation...
            const deck = await createDeck.mutateAsync({
              deck_name: actionData.deck.deck_name,
              description: actionData.deck.description
            });

            const cardPromises = actionData.cards.map(card =>
              createFlashcard.mutateAsync({
                deck_id: deck.deck_id,
                front_content: card.front_content,
                back_content: card.back_content
              })
            );

            await Promise.all(cardPromises);
          }
          break;

        case 'add_card':
          if (isSingleCard(actionData)) {
            await createFlashcard.mutateAsync({
              deck_id: parseInt(actionData.deck_id),
              front_content: actionData.front_content,
              back_content: actionData.back_content
            });
          }
          break;

        default:
          console.log('Unknown action type:', actionData.action);
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw error;
    }
  };

  return {
    processAIResponse,
    isProcessing: createDeck.isPending || createFlashcard.isPending,
    error: createDeck.error || createFlashcard.error
  };
} 
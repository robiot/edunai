"use client";

import { useChat } from "ai/react";
import { WalletCards } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from '@/hooks/useAuth';
import { State, Rating } from "ts-fsrs";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chat } from "@/components/ui/chat";
import { SelectSeparator } from "@/components/ui/select";

enum CardState {
  New = 'New',
  Learning = 'Learning',
  Review = 'Review',
  Relearning = 'Relearning'
}

interface FlashCard {
  card_id: number;
  front_content: string;
  back_content: string;
  next_review: string;
  retrievability?: number;
  stability?: number;
  difficulty?: number;
  elapsed_days?: number;
  scheduled_days?: number;
  reps?: number;
  lapses?: number;
  state?: CardState;
  last_review?: string;
}

const DeckPage = () => {
  const params = useParams();
  const deckId = params?.id as string;

  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const { session } = useAuth();

  const fetchDueCards = async (reviewAll: boolean = false) => {
    if (!deckId || !session?.access_token) return;

    try {
      const response = await fetch(
        `/api/fsrs?action=get_due_cards&deck_id=${deckId}&review_all=${reviewAll}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      setCards(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDueCards();
    }
  }, [deckId, session]);

  const currentCard = cards[currentCardIndex];

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    isLoading: isChatLoading,
  } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      console.log(response);
    },
  });

  // Helper function to get button style based on rating
  const getRatingButtonStyle = (rating: number) => {
    switch (rating) {
      case 1: // Again
        return "bg-red-600 hover:bg-red-700 text-white";
      case 2: // Hard
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case 3: // Good
        return "bg-green-600 hover:bg-green-700 text-white";
      case 4: // Easy
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "";
    }
  };

  // Helper function to convert our rating number to FSRS Rating enum
  const convertToFSRSRating = (rating: number): Rating => {
    switch (rating) {
      case 1:
        return Rating.Again;
      case 2:
        return Rating.Hard;
      case 3:
        return Rating.Good;
      case 4:
        return Rating.Easy;
      default:
        return Rating.Good; // Default case
    }
  };

  // Memoize handleRate
  const handleRate = useCallback(async (rating: number) => {
    if (!currentCard || !session?.access_token) return;

    try {
      const lastReview = currentCard.last_review ? new Date(currentCard.last_review) : new Date();
      const now = new Date();
      const elapsedDays = Math.max(0, (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

      const requestBody = {
        action: 'review_flashcard',
        card_id: currentCard.card_id,
        rating: convertToFSRSRating(rating), // Convert to FSRS Rating enum
        card_state: {
          stability: currentCard.stability || 0,
          difficulty: currentCard.difficulty || 0,
          elapsed_days: elapsedDays,
          scheduled_days: currentCard.scheduled_days || 0,
          reps: currentCard.reps || 0,
          lapses: currentCard.lapses || 0,
          state: currentCard.state || State.New, // Use State enum directly
          last_review: lastReview.toISOString()
        }
      };

      console.log('Sending request:', requestBody);

      const response = await fetch('/api/fsrs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });   

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Failed to submit rating: ${errorData.error || 'Unknown error'}`);
      }

      const updatedCard = await response.json();
      
      // Update the current card in the cards array
      setCards(prevCards => 
        prevCards.map(card => 
          card.card_id === currentCard.card_id ? {
            ...card,
            ...updatedCard,
            next_review: updatedCard.next_review,
            retrievability: updatedCard.retrievability,
            stability: updatedCard.stability,
            difficulty: updatedCard.difficulty,
            reps: updatedCard.reps,
            lapses: updatedCard.lapses,
            state: updatedCard.state,
            last_review: updatedCard.last_review
          } : card
        )
      );

      // Move to next card or show completion message
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsCardFlipped(false); // Reset flip state for new card
      } else {
        // All cards reviewed
        setCards([]); // Clear the current deck
        setIsCardFlipped(false); // Reset flip state
        await fetchDueCards(true); // Fetch all cards
      }
    } catch (error) {
      console.error('Error rating card:', error);
    }
  }, [currentCard, currentCardIndex, cards.length, session?.access_token, fetchDueCards]);

  // Add space bar handler for flipping cards
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!currentCard) return;
      
      switch (event.key) {
        case ' ': // Space bar
          event.preventDefault(); // Prevent page scroll
          setIsCardFlipped(prev => !prev);
          break;
        case '1':
          if (isCardFlipped) handleRate(1);
          break;
        case '2':
          if (isCardFlipped) handleRate(2);
          break;
        case '3':
          if (isCardFlipped) handleRate(3);
          break;
        case '4':
          if (isCardFlipped) handleRate(4);
          break;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentCard, isCardFlipped, handleRate]);

  return (
    <div className="flex flex-1 h-full flex-col md:flex-row">
      <Card className="bg-[#F3F6FA] rounded-none w-full md:max-w-72 flex-1 flex items-end justify-center flex-col">
        <div className="p-4 flex w-full">
          <Button className="w-full flex gap-2">
            <WalletCards size={24} />
            Add card to deck
          </Button>
        </div>
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
      <Container className="h-[unset] flex-1 rounded-none flex justify-center">
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Loading cards...
            </div>
          ) : cards.length > 0 && currentCard ? (
            <>
              <div className="flex flex-col items-center gap-3 py-16">
                <span className="text-4xl">{currentCard.front_content}</span>
                {isCardFlipped && (
                  <>
                    <SelectSeparator className="h-1 w-full" />
                    <span className="text-xl">{currentCard.back_content}</span>
                  </>
                )}
              </div>

              <div className="flex flex-1 gap-2 items-end justify-center py-6">
                {!isCardFlipped ? (
                  <Button 
                    className="font-semibold"
                    onClick={() => setIsCardFlipped(true)}
                  >
                    Show Answer (Space)
                  </Button>
                ) : (
                  <>
                    <Button
                      className={`${getRatingButtonStyle(1)} font-semibold`}
                      onClick={() => handleRate(1)}
                    >
                      Again
                    </Button>
                    <Button
                      className={`${getRatingButtonStyle(2)} font-semibold`}
                      onClick={() => handleRate(2)}
                    >
                      Hard 
                    </Button>
                    <Button
                      className={`${getRatingButtonStyle(3)} font-semibold`}
                      onClick={() => handleRate(3)}
                    >
                      Good 
                    </Button>
                    <Button
                      className={`${getRatingButtonStyle(4)} font-semibold`}
                      onClick={() => handleRate(4)}
                    >
                      Easy 
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div>No more cards due for review! 🎉</div>
              <Button 
                onClick={() => {
                  setCurrentCardIndex(0);
                  fetchDueCards(true); // Pass true to get all cards
                }}
              >
                Review Cards Again
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default DeckPage;

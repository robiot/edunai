/* eslint-disable sonarjs/no-small-switch */
/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable unicorn/no-nested-ternary */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletCards } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Rating, State } from "ts-fsrs";

import { Container } from "@/components/common/Container";
import { AiChat } from "@/components/ui/ai-chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectSeparator } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useDueCards } from "@/hooks/useDueCards";

import { CreateCardModal } from "./_components/CreateCardModal";
import { TextToSpeech } from "./_components/TTS";
import { AllCardsModal } from "./_components/AllCardsModal";

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
  // state?: CardState;
  last_review?: string;
}

const DeckPage = () => {
  const parameters = useParams();
  const deckId = parameters?.id as string;
  const queryClient = useQueryClient();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [reviewAll, setReviewAll] = useState(false);

  const { session } = useAuth();

  // Function to fetch due cards

  // Use React Query to fetch cards
  const {
    data: cards = [],
    isLoading,
    error,
    ...dueCards
  } = useDueCards(deckId, reviewAll);

  const currentCard = cards[currentCardIndex];

  // Mutation for rating cards
  const rateMutation = useMutation({
    mutationFn: async ({
      cardId,
      rating,
      cardState,
    }: {
      cardId: number;
      rating: Rating;
      cardState: any;
    }) => {
      if (!session?.access_token) throw new Error("No session");

      const response = await fetch("/api/fsrs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "review_flashcard",
          card_id: cardId,
          rating,
          card_state: cardState,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to submit rating");
      }

      return response.json();
    },
    onSuccess: (updatedCard) => {
      // Update the cards in the cache
      queryClient.setQueryData<FlashCard[]>(
        ["dueCards", deckId, reviewAll],
        (oldCards) => {
          if (!oldCards) return [];

          return oldCards.map((card) =>
            card.card_id === updatedCard.card_id
              ? { ...card, ...updatedCard }
              : card,
          );
        },
      );

      // Move to next card or show completion
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex((previous) => previous + 1);
        setIsCardFlipped(false);
      } else {
        // setCards([]);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
        setReviewAll(true);
        queryClient.invalidateQueries({ queryKey: ["dueCards", deckId] });
      }
    },
  });

  // Helper function to get button style based on rating
  const getRatingButtonStyle = (_rating: number) => {
    return "";
    // switch (rating) {
    //   case 1:
    //     return "bg-red-600 hover:bg-red-700 text-white";
    //   case 2:
    //     return " ";
    //   case 3:
    //     return "";
    //   case 4:
    //     return "";
    //   default:
    //     return "";
    // }
  };

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
        return Rating.Good;
    }
  };

  const handleRate = useCallback(
    async (rating: number) => {
      if (!currentCard) return;

      const lastReview = currentCard.last_review
        ? new Date(currentCard.last_review)
        : new Date();
      const now = new Date();
      const elapsedDays = Math.max(
        0,
        (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24),
      );

      const cardState = {
        stability: currentCard.stability || 0,
        difficulty: currentCard.difficulty || 0,
        elapsed_days: elapsedDays,
        scheduled_days: currentCard.scheduled_days || 0,
        reps: currentCard.reps || 0,
        lapses: currentCard.lapses || 0,
        state: currentCard.state || State.New,
        last_review: lastReview.toISOString(),
      };

      rateMutation.mutate({
        cardId: currentCard.card_id,
        rating: convertToFSRSRating(rating),
        cardState,
      });
    },
    [currentCard, rateMutation],
  );

  // Add space bar handler for flipping cards
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if we're focused on an input element or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!currentCard) return;

      switch (event.key) {
        case " ":
          event.preventDefault();
          setIsCardFlipped((previous) => !previous);
          break;
        case "1":
          if (isCardFlipped) handleRate(1);

          break;
        case "2":
          if (isCardFlipped) handleRate(2);

          break;
        case "3":
          if (isCardFlipped) handleRate(3);

          break;
        case "4":
          if (isCardFlipped) handleRate(4);

          break;
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [currentCard, isCardFlipped, handleRate]);

  return (
    <div className="flex flex-1 h-full flex-col md:flex-row">
      <Card className="bg-[#F3F6FA] rounded-none w-full md:max-w-72 flex-1 flex items-end justify-center flex-col">
        <div className="flex h-[calc(100vh-9rem)]">
          <AiChat deckId={deckId} />
        </div>
      </Card>
      <Container className="h-[unset] flex-1 rounded-none flex justify-center">
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Loading cards...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              Error loading cards: {(error as Error).message}
            </div>
          ) : cards.length > 0 && currentCard ? (
            <>
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="flex gap-4">
                  <TextToSpeech text={currentCard.front_content} />
                  <span className="text-4xl">{currentCard.front_content}</span>
                </div>
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
                      disabled={rateMutation.isPending}
                    >
                      Again
                    </Button>
                    <Button
                      className={`${getRatingButtonStyle(2)} font-semibold`}
                      onClick={() => handleRate(2)}
                      disabled={rateMutation.isPending}
                    >
                      Hard
                    </Button>
                    <Button
                      className={`${getRatingButtonStyle(3)} font-semibold`}
                      onClick={() => handleRate(3)}
                      disabled={rateMutation.isPending}
                    >
                      Good
                    </Button>
                    <Button
                      className={`${getRatingButtonStyle(4)} font-semibold`}
                      onClick={() => handleRate(4)}
                      disabled={rateMutation.isPending}
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
                  setReviewAll(true);
                  queryClient.invalidateQueries({
                    queryKey: ["dueCards", deckId],
                  });
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

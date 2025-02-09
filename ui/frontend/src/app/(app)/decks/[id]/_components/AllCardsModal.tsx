"use client";

import { ListFilter } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFSRS } from "@/hooks/useFSRS";

// Interface for the card data structure
interface Card {
  card_id: number;
  front_content: string;
  back_content: string;
  next_review: string;
}

interface AllCardsModalProperties {
  deckId: string;
  children?: ReactNode;
}

export function AllCardsModal({ deckId, children }: AllCardsModalProperties) {
  const { useDueCards } = useFSRS();

  // Set a high limit to get all cards
  const { data: cards = [], isLoading } = useDueCards(Number(deckId), 1000);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex gap-2">
            <ListFilter size={20} />
            View All Cards
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Cards in Deck</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-4">Loading cards...</div>
        ) : (
          <div className="grid gap-4">
            {cards.map((card: Card) => (
              <div
                key={card.card_id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="font-medium">Front: {card.front_content}</div>
                <div className="text-muted-foreground">
                  Back: {card.back_content}
                </div>
                <div className="text-sm text-muted-foreground">
                  Next Review: {new Date(card.next_review).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

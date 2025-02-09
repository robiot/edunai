"use client";

import { ListFilter, Trash2, Pencil } from "lucide-react";
import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useFSRS } from "@/hooks/useFSRS";
import { Input } from "@/components/ui/input";

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
  // State for selected cards and editing mode
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editedFront, setEditedFront] = useState("");
  const [editedBack, setEditedBack] = useState("");

  // Get necessary hooks
  const { useDueCards, useDeleteFlashcard, useUpdateFlashcard } = useFSRS();
  const deleteCard = useDeleteFlashcard();
  const updateCard = useUpdateFlashcard();

  // Set a high limit to get all cards
  const { data: cards = [], isLoading } = useDueCards(Number(deckId), 1000);

  // Handle checkbox selection
  const handleSelect = (cardId: number) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Handle delete selected cards
  const handleDeleteSelected = async () => {
    // Delete each selected card
    for (const cardId of selectedCards) {
      await deleteCard.mutateAsync(cardId);
    }
    setSelectedCards([]); // Clear selection after delete
  };

  // Handle edit card
  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setEditedFront(card.front_content);
    setEditedBack(card.back_content);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingCard) return;
    
    await updateCard.mutateAsync({
      card_id: editingCard.card_id,
      front_content: editedFront,
      back_content: editedBack
    });
    
    setEditingCard(null);
  };

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

        {/* Action buttons */}
        {selectedCards.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedCards.length})
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-4">Loading cards...</div>
        ) : (
          <div className="grid gap-4">
            {cards.map((card: Card) => (
              <div
                key={card.card_id}
                className="border rounded-lg p-4"
              >
                <div className="flex gap-4">
                  {/* Main content area */}
                  <div className="flex-1">
                    {editingCard?.card_id === card.card_id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <Input
                          value={editedFront}
                          onChange={(e) => setEditedFront(e.target.value)}
                          placeholder="Front content"
                        />
                        <Input
                          value={editedBack}
                          onChange={(e) => setEditedBack(e.target.value)}
                          placeholder="Back content"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCard(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="font-medium">Front: {card.front_content}</div>
                        <div className="text-muted-foreground">Back: {card.back_content}</div>
                        <div className="text-sm text-muted-foreground">
                          Next Review: {new Date(card.next_review).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-center gap-2">
                    {editingCard?.card_id !== card.card_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCard(card)}
                        className="h-8 w-8 p-0"  // Make it square
                      >
                        <Pencil size={16} />
                      </Button>
                    )}
                    <Checkbox
                      checked={selectedCards.includes(card.card_id)}
                      onCheckedChange={() => handleSelect(card.card_id)}
                      className="h-4 w-4 rounded-[6px] "  // Make checkbox slightly smaller than button
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

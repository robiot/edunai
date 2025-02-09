import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";

export function useFSRS() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  });

  // Get all decks
  const useDecks = () => {
    return useQuery({
      queryKey: ["decks"],
      queryFn: async () => {
        const response = await fetch("/api/fsrs?action=get_decks", {
          headers: getHeaders(),
        });

        if (!response.ok) throw new Error("Failed to fetch decks");

        return response.json();
      },
      enabled: !!session,
    });
  };

  // Create a new deck
  const useCreateDeck = () => {
    return useMutation({
      mutationFn: async (deckData: {
        deck_name: string;
        description?: string;
        parent_deck_id?: number;
      }) => {
        const response = await fetch("/api/fsrs", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ action: "create_deck", ...deckData }),
        });

        if (!response.ok) throw new Error("Failed to create deck");

        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["decks"] });
      },
    });
  };

  // Get due cards
  const useDueCards = (deck_id?: number, limit: number = 10) => {
    return useQuery({
      queryKey: ["due_cards", deck_id],
      queryFn: async () => {
        const parameters = new URLSearchParams({
          action: "get_due_cards",
          ...(deck_id && { deck_id: deck_id.toString() }),
          limit: limit.toString(),
        });
        const response = await fetch(`/api/fsrs?${parameters}`, {
          headers: getHeaders(),
        });

        if (!response.ok) throw new Error("Failed to fetch due cards");

        return response.json();
      },
      enabled: !!session,
    });
  };

  // Review a flashcard
  const useReviewCard = () => {
    return useMutation({
      mutationFn: async ({
        card_id,
        rating,
      }: {
        card_id: number;
        rating: number;
      }) => {
        const response = await fetch("/api/fsrs", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ action: "review_flashcard", card_id, rating }),
        });

        if (!response.ok) throw new Error("Failed to review card");

        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["due_cards"] });
      },
    });
  };

  // Create a new flashcard
  const useCreateFlashcard = () => {
    return useMutation({
      mutationFn: async (cardData: {
        deck_id: number;
        front_content: string;
        back_content: string;
      }) => {
        const response = await fetch("/api/fsrs", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ action: "create_flashcard", ...cardData }),
        });

        if (!response.ok) throw new Error("Failed to create flashcard");

        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["due_cards"] });
      },
    });
  };

  // Delete a deck
  const useDeleteDeck = () => {
    return useMutation({
      mutationFn: async (deck_id: number) => {
        const response = await fetch("/api/fsrs", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ action: "delete_deck", deck_id }),
        });

        if (!response.ok) throw new Error("Failed to delete deck");

        return response.json();
      },
      onSuccess: () => {
        // Invalidate both decks and due cards queries
        queryClient.invalidateQueries({ queryKey: ["decks"] });
        queryClient.invalidateQueries({ queryKey: ["due_cards"] });
      },
    });
  };

  // Delete a flashcard
  const useDeleteFlashcard = () => {
    return useMutation({
      mutationFn: async (card_id: number) => {
        const response = await fetch("/api/fsrs", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ action: "delete_flashcard", card_id }),
        });

        if (!response.ok) throw new Error("Failed to delete flashcard");

        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["due_cards"] });
      },
    });
  };

  // Update a flashcard
  const useUpdateFlashcard = () => {
    return useMutation({
      mutationFn: async ({
        card_id,
        front_content,
        back_content,
      }: {
        card_id: number;
        front_content: string;
        back_content: string;
      }) => {
        const response = await fetch("/api/fsrs", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            action: "update_flashcard",
            card_id,
            front_content,
            back_content,
          }),
        });

        if (!response.ok) throw new Error("Failed to update flashcard");

        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["due_cards"] });
      },
    });
  };

  return {
    useDecks,
    useCreateDeck,
    useDueCards,
    useReviewCard,
    useCreateFlashcard,
    useDeleteDeck,
    useDeleteFlashcard,
    useUpdateFlashcard,
  };
}

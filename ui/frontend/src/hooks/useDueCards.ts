import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";

// Use React Query to fetch cards
export const useDueCards = (deckId: string, reviewAll: boolean) => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["dueCards", deckId, reviewAll],
    queryFn: async () => {
      if (!deckId || !session?.access_token) return [];

      const response = await fetch(
        `/api/fsrs?action=get_due_cards&deck_id=${deckId}&review_all=${reviewAll}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }

      return response.json();
    },
    enabled: !!session && !!deckId,
  });
};

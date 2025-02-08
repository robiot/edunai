import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

interface Deck {
  deck_id: number;
  deck_name: string;
  description?: string;
  parent_deck_id?: number;
  created_at: string;
  user_id: string;
}

export const useDecks = () => {
  return useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: async () => {
      // Add debug logs
      console.log("Checking auth session...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Session:", session); // This will help us see if we have a session

      const accessToken = session?.access_token;

      console.log("Access Token exists:", !!accessToken); // Check if we have a token

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      console.log("Making API request...");
      const response = await fetch("/api/fsrs?action=get_decks", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `sb-access-token=${accessToken}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();

        console.error("API Error:", errorData); // Log any API errors
        throw new Error(errorData.error || "Failed to fetch decks");
      }

      return response.json();
    },
  });
};

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

type Deck = {};
export const useDecks = () => {
  return useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const response = await api.get("/decks");

      console.log(response);

      return response.data;
    },
  });
};

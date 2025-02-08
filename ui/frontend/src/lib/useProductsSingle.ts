import { useQuery } from "@tanstack/react-query";

export const useProductsSingle = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<undefined> => {},
  });
};

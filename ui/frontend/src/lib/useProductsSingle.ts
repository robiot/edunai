import { useQuery } from "@tanstack/react-query";

import { enviroment } from "./enviroment";

type Product = {
  id: string;
  created_by: string;
  name: string;
  description: string;
  media: string[];
  requireWorldCoin: boolean;
  limitPerHuman: number;
  price: number;
};

export const useProductsSingle = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product | undefined> => {
      const response = await fetch(`${enviroment.BACKEND_URL}/product`, {
        method: "GET",
        // headers: {
        //   "Content-Type": "application/json",
        // },
      });

      if (response.status !== 200) {
        alert("Error");

        return;
      }

      const jsonData = (await response.json()) as {
        data: Product[]; // there is more
      };

      return jsonData.data
        .map((it) => ({ ...it, price: it.price / 100 }))
        .find((it) => it.id === id);
    },
  });
};

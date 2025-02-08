import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { DataFormat } from "@/app/(app)/_components/columns";

import { enviroment } from "./enviroment";

export const useProducts = () => {
  const account = useAccount();

  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<DataFormat[]> => {
      const response = await fetch(`${enviroment.BACKEND_URL}/product`, {
        method: "GET",
        // headers: {
        //   "Content-Type": "application/json",
        // },
      });

      if (response.status !== 200) {
        alert("Error");

        return [];
      }

      const jsonData = (await response.json()) as {
        data: DataFormat[]; // there is more
      };

      return jsonData.data
        .filter(
          (it) =>
            it.created_by.toLowerCase() === account.address?.toLowerCase(),
        )
        .map((it) => ({ ...it, price: it.price / 100 }));
    },
  });
};

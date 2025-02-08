import { useQuery } from "@tanstack/react-query";

import { enviroment } from "./enviroment";

type Review = {
  status: number;
  data: { summary: string; reviews: { description: string; score: number }[] };
  errors: [];
};

export const useReviews = (id: string) => {
  return useQuery({
    queryKey: ["reviews", id],
    queryFn: async (): Promise<Review["data"] | undefined> => {
      const response = await fetch(
        `${enviroment.BACKEND_URL}/product/${id}/review`,
        {
          method: "GET",
          // headers: {
          //   "Content-Type": "application/json",
          // },
        },
      );

      if (response.status !== 200) {
        alert("Error");

        return;
      }

      const jsonData = (await response.json()) as Review;

      console.log(jsonData);

      // calculate the average score

      return jsonData.data;
    },
  });
};

export const getAverageScore = (reviews?: Review["data"]["reviews"]) => {
  if (!reviews) return 0;

  const totalScore = reviews.reduce(
    (accumulator, review) => accumulator + review.score,
    0,
  );

  return totalScore / reviews.length;
};

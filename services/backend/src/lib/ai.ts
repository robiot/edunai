import OpenAI from "openai";

import { Product, Review } from "../app";
import pg from "../pg";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export const generateReview = async (productId: string) => {
  // eslint-disable-next-line unicorn/no-await-expression-member
  const data = (await pg<Review>("reviews").select("*")).filter(
    (r) => r.product_id === productId,
  );

  const products = await pg<Product>("products").select("*");

  const product = products.find((p) => p.id === productId);

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content:
          "Given a product name, description a list of reviews write a short review summary of the product. Try to get the most useful data and ignore unuseful or troll reviews.\n" +
          "Prioritise recent reviews and the general sentiment of the majority of users. Give a bit more weight to negative reviews that indicate problems with the product. \n" +
          "\n" +
          "NAME: " +
          product.name +
          "\n" +
          "DESCRIPTION:\n" +
          product.description +
          "\n" +
          "\n" +
          "REVIEWS:\n" +
          "\n" +
          JSON.stringify(data) +
          "\n" +
          "OUTPUT ONLY THE SUMMERY",
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const review = chatCompletion.choices[0].message.content;

  console.log(review);

  await pg<Product>("products")
    .update({
      reviewSummary: review,
    })
    .where({
      id: productId,
    });
};

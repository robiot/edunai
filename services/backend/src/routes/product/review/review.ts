/* eslint-disable @typescript-eslint/no-unused-vars */
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";

import { Product, Review } from "../../../app";
import { generateReview } from "../../../lib/ai";
import pg from "../../../pg";
import { reject, respond } from "../../../util/response";

const _openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

const ReviewHandler = Router({
  mergeParams: true,
});

const ReviewSchema = Type.Object({
  description: Type.String(),
  score: Type.Number(),
});

ReviewHandler.get("/", async (request, response) => {
  const data = (await pg<Review>("reviews").select("*")).filter(
    (r) => r.product_id === request.params.product_id,
  );

  const products = await pg<Product>("products").select("*");
  const product = products.filter((p) => p.id === request.params.product_id);

  if (product.length === 0) return reject(response, 500);

  return respond(response, 200, {
    summary: product[0].reviewSummary,
    reviews: data,
  });
});

ReviewHandler.post("/", async (request, response) => {
  const products = await pg<Product>("products").select("*");
  const product = products.filter((p) => p.id === request.params.product_id);

  if (product.length === 0) return reject(response, 404);

  if (!Value.Check(ReviewSchema, request.body)) {
    return reject(response, 400);
  }

  const newReview: Review = {
    id: randomUUID(),
    created_at: new Date(),
    product_id: request.params.product_id,
    ...request.body,
  };

  await pg<Review>("reviews").insert(newReview);

  await generateReview(product[0].id);

  return respond(response, 200, newReview);
});

ReviewHandler.delete("/:id", async (request, response) => {
  await pg<Review>("reviews")
    .where({
      id: request.params.id,
    })
    .delete();

  return respond(response, 200);
});

export default ReviewHandler;

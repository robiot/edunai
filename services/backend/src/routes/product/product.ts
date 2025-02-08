import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Router } from "express";
import { randomUUID } from "node:crypto";

import { Product } from "../../app";
import pg from "../../pg";
import { reject, respond } from "../../util/response";
import ReviewHandler from "./review/review";

const ProductHandler = Router();

const ProductSchema = Type.Object({
  created_by: Type.String(),
  name: Type.String(),
  description: Type.String(),
  media: Type.Array(Type.String()),
  requireWorldCoin: Type.Boolean(),
  limitPerHuman: Type.Number(),
  price: Type.Number(),
});

ProductHandler.get("/:id", async (request, response) => {
  const data = await pg<Product>("products").select("*").where({
    id: request.params.id,
  });

  if (data.length === 0) return reject(response, 404);

  return respond(response, 200, data[0]);
});

ProductHandler.get("/", async (request, response) => {
  const data = request.query.created_by
    ? await pg<Product>("products").select("*").where({
        created_by: request.query.id,
      })
    : await pg<Product>("products").select("*");

  return respond(response, 200, data);
});

ProductHandler.post("/", async (request, response) => {
  if (!Value.Check(ProductSchema, request.body)) {
    return reject(response, 400);
  }

  const newProduct: Product = {
    id: randomUUID(),
    created_at: new Date(),
    ...request.body,
    reviewSummary: "",
  };

  await pg<Product>("products").insert(newProduct);

  return respond(response, 200, newProduct);
});

ProductHandler.patch("/:id", async (request, response) => {
  if (!Value.Check(ProductSchema, request.body)) {
    return reject(response, 400);
  }

  await pg<Product>("products")
    .update({
      ...request.body,
    })
    .where({
      id: request.params.id,
    });

  return respond(response, 200);
});

ProductHandler.delete("/:id", async (request, response) => {
  await pg<Product>("products")
    .where({
      id: request.params.id,
    })
    .delete();

  return respond(response, 200);
});

ProductHandler.use("/:product_id/review", ReviewHandler);

export default ProductHandler;

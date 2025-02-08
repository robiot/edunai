import express, { json } from "express";

import pg from "./pg";
import ProductHandler from "./routes/product/product";
import cors from "cors";

const router = express();

export type Product = {
  id: string;
  created_by: string;
  name: string;
  description: string;
  price: number;
  media: string[];
  requireWorldCoin: boolean;
  limitPerHuman: number;
  created_at: Date;
  reviewSummary: string;
};

export type Review = {
  id: string;
  product_id: string;
  score: number;
  description: string;
  created_at: Date;
};

(async () => {
  try {
    // Check if the table exists, and create it if it doesn't

    const existsProducts = await pg.schema.hasTable("products");

    if (!existsProducts) {
      await pg.schema.createTable("products", (table) => {
        table.string("id").primary();
        table.string("created_by").notNullable();
        table.string("name");
        table.text("description");
        table.integer("price");
        table.specificType("media", "text ARRAY");
        table.boolean("requireWorldCoin");
        table.integer("limitPerHuman");
        table.datetime("created_at");
        table.string("reviewSummary");
      });
      console.log("Created products table!");
    }

    const existsReviews = await pg.schema.hasTable("reviews");

    if (!existsReviews) {
      await pg.schema.createTable("reviews", (table) => {
        table.string("id").primary();
        table.string("product_id").notNullable().index();
        table.integer("score").notNullable();
        table.text("description");
        table.datetime("created_at");
        table
          .foreign("product_id")
          .references("id")
          .inTable("products")
          .onDelete("CASCADE");
      });

      console.log("Reviews table created!");
    }

    const products = await pg<Product>("products").select("*");
    const reviews = await pg<Review>("reviews").select("*");

    console.log("Products:", products);
    console.log("Reviews:", reviews);
  } catch (error) {
    console.error("Error:", error);
  }
})();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
router.use(cors());
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
router.use(json());
router.use("/product", ProductHandler);
router.listen(8080, () => {});

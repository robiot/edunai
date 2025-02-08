"use client";

import { Plus } from "lucide-react";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";

const ProductsPage = () => {
  return (
    <Container>
      <div className="mb-10 mt-24 flex justify-between items-center">
        <h1 className="text-3xl font-medium">Products</h1>
        <Button className="gap-2 rounded-xl text-background">
          <Plus />
          Create New Product
        </Button>
      </div>
    </Container>
  );
};

export default ProductsPage;

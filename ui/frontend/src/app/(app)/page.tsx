"use client";

import { Plus } from "lucide-react";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";

const ProductsPage = () => {
  return (
    <div>
      <div className="bg-secondary py-7">
        <h1 className="text-4xl">Hello Elliot</h1>
        <h2 className="text-4xl">What can I help you with</h2>
      </div>
      <Container>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-medium">Products</h1>
          <Button className="gap-2 rounded-xl text-background">
            <Plus />
            Create New Product
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ProductsPage;

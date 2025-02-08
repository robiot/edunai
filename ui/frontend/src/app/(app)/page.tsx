"use client";

import { Plus } from "lucide-react";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/useProducts";

import { columns_main } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { ExpandCreate } from "./_components/ExpandCreate";

const ProductsPage = () => {
  const data = useProducts();

  return (
    <Container>
      <div className="mb-10 mt-24 flex justify-between items-center">
        <h1 className="text-3xl font-medium">Products</h1>
        <ExpandCreate id="Create Product">
          <Button className="gap-2 rounded-xl text-background">
            <Plus />
            Create New Product
          </Button>
        </ExpandCreate>
      </div>

      <DataTable
        columns={columns_main}
        isSubTable={false}
        currentPageData={data}
        // setActivePage={() => {}}
      />
    </Container>
  );
};

export default ProductsPage;

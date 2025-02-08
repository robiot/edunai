import { FC, ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useProductsSingle } from "@/lib/useProductsSingle";

import { DeleteButton } from "./DeleteButton";
import { ProductForm } from "./ProductForm";

const ProductThing: FC<{
  id: string;
}> = ({ id }) => {
  const data = useProductsSingle(id);

  if (data.isLoading) {
    return (
      <div className="w-full h-96 items-center justify-center">
        <Spinner size="sm" className="text-white" />
      </div>
    );
  }

  return (
    <ProductForm
      kind="modify"
      defaultValues={{
        id: data.data?.id,
        name: data.data?.name,
        description: data.data!.description,
        media: data.data?.media.at(0),
        price: data.data?.price!,
        purchaseLimitPerHuman: data.data?.limitPerHuman,
      }}
    />
  );
};

export const ExpandSheet: FC<{
  children: ReactNode;
  id: string;
  active?: boolean;
}> = ({ children, id }) => {
  return (
    <Sheet>
      <SheetTrigger className="text-primary text-left">{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[30rem] p-7 overflow-auto">
        <SheetHeader>
          <SheetTitle>{id}</SheetTitle>
          <DeleteButton id={id} />
        </SheetHeader>
        <div className="flex flex-col gap-5 max-h-full relative">
          <ProductThing id={id} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

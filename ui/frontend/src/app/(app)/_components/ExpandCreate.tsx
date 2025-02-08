import { FC, ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ProductForm } from "./ProductForm";

export const ExpandCreate: FC<{
  children: ReactNode;
  id: string;
}> = ({ children, id }) => {
  return (
    <Sheet>
      <SheetTrigger className="text-primary text-left" asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[30rem] p-7 overflow-auto">
        <SheetHeader>
          <SheetTitle>{id}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 max-h-full relative">
          {/* <div className="text-xl font-bold">Product details</div> */}

          <ProductForm kind="create" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

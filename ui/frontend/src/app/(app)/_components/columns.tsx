/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { ColumnDef, RowData } from "@tanstack/react-table";

// This type is used to define the shape of our data.
export type DataFormat = {
  id: string;
  name: string;
  price: number;
  created_by: string;
  // totalSales: number;
};

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "number";
    selectOptions?: string[];
  }
}

export const columns_main: ColumnDef<DataFormat>[] = [
  {
    accessorKey: "id",
    header: "ID",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    meta: {
      filterVariant: "number",
    },
  },
];

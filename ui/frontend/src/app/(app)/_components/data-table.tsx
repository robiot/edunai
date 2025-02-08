/* eslint-disable prettier/prettier */
"use client";

import { UseQueryResult } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { FC, ReactNode, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataFormat } from "./columns";
import { ExpandSheet } from "./ExpandSheet";

export const DataTable: FC<{
  isSubTable: boolean; // used to indicate if its inside a sheet, so not recursive

  columns: ColumnDef<DataFormat>[];

  header?: ReactNode;

  currentPageData: UseQueryResult<DataFormat[], Error>;
}> = ({ isSubTable, columns, currentPageData }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: currentPageData.data || [],
    columns: columns,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    // events
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 1,
      },
    },

    enableColumnResizing: true,
    columnResizeMode: "onChange",
    manualPagination: true,
    pageCount: -1,
  });

  return (
    <div className="flex flex-col">
      <div className={cn("p-0", "flex flex-col gap-2")}>
        <div className="bg-white rounded-md border text-xs max-h-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.getCanSort() &&
                          "cursor-pointer select-none"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        width: header.column.getSize(),
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div className="flex gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}

                        <div className="text-sm">
                          {!header.column.getIsSorted() && (
                            <ChevronsUpDown className="text-sm w-4" />
                          )}

                          {header.column.getIsSorted() === "desc" && (
                            <ChevronDown className="text-sm w-4" />
                          )}

                          {header.column.getIsSorted() === "asc" && (
                            <ChevronUp className="text-sm w-4" />
                          )}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {currentPageData.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs"
                  >
                    Loading data, please wait...
                  </TableCell>
                </TableRow>
              ) : (table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-xs">
                        {cell.column.id === "id" ? (
                          <ExpandSheet
                            id={cell.getValue() as string}
                            active={!isSubTable}
                          >
                            {(cell.getValue() as string).slice(0, 8)}
                          </ExpandSheet>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-5 flex w-full justify-between">
        <div className="text-xs text-muted-foreground">
          Showing{" "}
          <strong>
            {(table.getState().pagination.pageIndex - 1) * 10}-
            {table.getState().pagination.pageIndex * 10}
          </strong>{" "}
        </div>
      </div>
    </div>
  );
};

"use client";

import { MoreHorizontal } from "lucide-react";
import { FC } from "react";

import Twemoji from "@/components/common/Twemoji";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const DecksTable: FC = () => {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-full">Deck</TableHead>
          <TableHead className="min-w-[6rem]">New</TableHead>
          <TableHead className="min-w-[6rem]">Learn</TableHead>
          <TableHead className="min-w-[4rem]">Due</TableHead>
          <TableHead className="min-w-[1rem]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">
            <div className="flex gap-2">
              <Twemoji emoji="🇨🇳"></Twemoji>
              Mandarin
            </div>
          </TableCell>
          <TableCell>2</TableCell>
          <TableCell>1</TableCell>
          <TableCell>2</TableCell>
          <TableCell>
            <MoreHorizontal />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

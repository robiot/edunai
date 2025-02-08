"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { FC } from "react";

import Twemoji from "@/components/common/Twemoji";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const DecksTable: FC = () => {
  return (
    <>
      <Table>
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
      <div>
        <Button
          className="w-full  mt-8 flex gap-2 items-center border-2"
          variant="outline"
        >
          <Plus />
          Create Deck
        </Button>
      </div>
    </>
  );
};

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";

import Twemoji from "@/components/common/Twemoji";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDecks } from "@/hooks/useDecks";

export const DecksTable: FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  // const decks = useQuery({
  //   queryKey: ["decks"],
  //   queryFn: () => {
  //     return [
  //       {
  //         id: "1",
  //         name: "Mandarin",
  //         emoji: "🇨🇳",
  //         new: 10,
  //         learn: 5,
  //         due: 3,
  //       },
  //     ];
  //   },
  // });

  const decks = useDecks();

  const deletedeck = useMutation({
    mutationKey: ["deleteDeck"],
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/decks/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete deck");

      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });

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
          {decks.data?.map((deck: any) => (
            <TableRow
              key={deck.id}
              onClick={() => {
                router.push(`/decks/${deck.id}`);
              }}
            >
              <TableCell className="font-medium">
                <div className="flex gap-2">
                  <Twemoji emoji={deck.emoji || ""} />
                  {deck.name}
                </div>
              </TableCell>
              <TableCell>{deck.new}</TableCell>
              <TableCell>{deck.learn}</TableCell>
              <TableCell>{deck.due}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deletedeck.mutate(deck.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Deck
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Button
          className="w-full mt-8 flex gap-2 items-center border-2"
          variant="outline"
        >
          <Plus /> Create Deck
        </Button>
      </div>
    </>
  );
};

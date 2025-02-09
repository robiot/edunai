"use client";

import { useQueryClient } from "@tanstack/react-query";
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
import { useFSRS } from "@/hooks/useFSRS";

import { CreateDeckModal } from "./CreateDeckModal";

interface Deck {
  deck_id: number;
  deck_name: string;
  emoji: string;
  created_at: string;
  description?: string;
}

export const DecksTable: FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { useDeleteDeck } = useFSRS();

  // Fetch decks with proper error handling
  const { data: decks, isLoading, isError, error } = useDecks();

  // Use the new delete deck mutation
  const deleteDeck = useDeleteDeck();

  // Loading state with spinner or skeleton
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state with retry button
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Error loading decks"}
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["decks"] })}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (!decks?.length) {
    return (
      <div className="text-center py-8 flex flex-col gap-4">
        <p className="text-muted-foreground mb-4">No decks found</p>
        <CreateDeckModal>
          <Button className="w-full flex gap-2 items-center" variant="outline">
            <Plus className="h-4 w-4" /> Create your first deck
          </Button>
        </CreateDeckModal>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Deck</TableHead>
            <TableHead className="min-w-[12rem]">Created</TableHead>
            <TableHead className="min-w-[1rem]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decks.map((deck: Deck) => (
            <TableRow
              key={deck.deck_id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/decks/${deck.deck_id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-4">
                  <div>
                    <Twemoji emoji={deck.emoji} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{deck.deck_name}</span>
                    {/* {deck.description && (
                      <span className="text-sm text-muted-foreground">
                        {deck.description}
                      </span>
                    )} */}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(deck.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        
                        if (confirm("Are you sure you want to delete this deck?")) {
                          deleteDeck.mutate(deck.deck_id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Deck
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <CreateDeckModal>
          <Button
            className="w-full mt-8 flex gap-2 items-center"
            variant="outline"
          >
            <Plus className="h-4 w-4" /> Create New Deck
          </Button>
        </CreateDeckModal>
      </div>
    </>
  );
};

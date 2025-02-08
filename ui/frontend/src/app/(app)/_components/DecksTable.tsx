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
import { supabase } from "@/lib/supabase";

import { CreateDeckModal } from "./CreateDeckModal";

export const DecksTable: FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch decks with proper error handling
  const { data: decks, isLoading, isError, error } = useDecks();

  // Delete deck mutation with proper error handling
  const deleteDeck = useMutation({
    mutationFn: async (deckId: number) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/fsrs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: `sb-access-token=${accessToken}`,
        },
        body: JSON.stringify({
          action: "delete_deck",
          deck_id: deckId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to delete deck");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

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
          {decks.map((deck) => (
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

                        if (
                          confirm("Are you sure you want to delete this deck?")
                        ) {
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

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { supabase } from "@/lib/supabase";

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

// Update type definition to match the API response
interface Deck {
  deck_id: number;
  deck_name: string;
  description?: string;
  parent_deck_id?: number;
  created_at: string;
  user_id: string;
}

export const DecksTable: FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch decks with proper error handling
  const { data: decks, isLoading, isError, error } = useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: async () => {
      // Add debug logs
      console.log('Checking auth session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session); // This will help us see if we have a session

      const accessToken = session?.access_token;
      console.log('Access Token exists:', !!accessToken); // Check if we have a token

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      console.log('Making API request...');
      const response = await fetch('/api/fsrs?action=get_decks', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cookie': `sb-access-token=${accessToken}`
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData); // Log any API errors
        throw new Error(errorData.error || 'Failed to fetch decks');
      }

      return response.json();
    },
  });

  // Delete deck mutation with proper error handling
  const deleteDeck = useMutation({
    mutationFn: async (deckId: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/fsrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Cookie': `sb-access-token=${accessToken}`
        },
        body: JSON.stringify({
          action: 'delete_deck',
          deck_id: deckId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete deck');
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
          {error instanceof Error ? error.message : 'Error loading decks'}
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
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">No decks found</p>
        <Button
          className="flex gap-2 items-center"
          variant="outline"
          onClick={() => {/* TODO: Implement create deck */}}
        >
          <Plus className="h-4 w-4" /> Create your first deck
        </Button>
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
                <div className="flex flex-col">
                  <span className="font-medium">{deck.deck_name}</span>
                  {deck.description && (
                    <span className="text-sm text-muted-foreground">
                      {deck.description}
                    </span>
                  )}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this deck?')) {
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
        <Button
          className="w-full mt-8 flex gap-2 items-center"
          variant="outline"
          onClick={() => {/* TODO: Implement create deck */}}
        >
          <Plus className="h-4 w-4" /> Create New Deck
        </Button>
      </div>
    </>
  );
};

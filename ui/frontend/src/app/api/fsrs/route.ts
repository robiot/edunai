import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  Card,
  createEmptyCard,
  FSRS,
  generatorParameters,
  Rating,
  State,
} from "ts-fsrs";

import { environment } from "@/lib/environment";

// Initialize FSRS scheduler with default parameters
const parameters = generatorParameters();
const scheduler = new FSRS(parameters);

// Type definitions
interface DeckBase {
  deck_id: number;
  deck_name: string;
  description?: string;
  parent_deck_id?: number;
}

interface FlashcardBase {
  front_content: string;
  back_content: string;
  deck_id: number;
}

interface FlashcardReview {
  card_id: number;
  rating: number; // 1-4 corresponding to Rating enum
}

interface FlashcardResponse {
  card_id: number;
  deck_id: number;
  deck_name: string;
  front_content: string;
  back_content: string;
  next_review: string;
  retrievability?: number;
  days_overdue?: number;
}

// Update the getCurrentUser function to use environment variables
async function getCurrentUser(): Promise<{
  user: string;
  supabaseAuth: SupabaseClient;
}> {
  const cookieStore = cookies();
  const authHeader = headers().get("authorization");

  // Get token from Authorization header
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new Error("Not authenticated");
  }

  // Create a Supabase client with the auth token
  const supabaseAuth = createClient(
    environment.SUPABASE_URL,
    environment.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  // Get the user data from the token
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    console.error("Auth error:", error); // Add debug logging
    throw new Error("Not authenticated");
  }

  return { user: user.id, supabaseAuth };
}

// Update the route handlers to use the authenticated client
export async function POST(request: Request) {
  try {
    const { user, supabaseAuth } = await getCurrentUser();
    const body = await request.json();
    const { action } = body;

    // Use supabaseAuth instead of the global supabase client
    switch (action) {
      case "create_deck":
        return handleCreateDeck(body, user, supabaseAuth);
      case "create_flashcard":
        return handleCreateFlashcard(body, supabaseAuth);
      case "review_flashcard":
        return handleReviewFlashcard(body, supabaseAuth);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// Update the GET handler to use the user ID from getCurrentUser
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const { user, supabaseAuth } = await getCurrentUser();

    switch (action) {
      case "get_decks":
        return handleGetDecks(user);
      case "get_due_cards":
        return handleGetDueCards(searchParams);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// Update handler functions to use the authenticated client
async function handleCreateDeck(body: any, userId: string, supabaseAuth: any) {
  const { deck_name, description, parent_deck_id } = body;

  const { data, error } = await supabaseAuth
    .from("decks")
    .insert({
      deck_name,
      description,
      parent_deck_id,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

async function handleCreateFlashcard(body: any, supabaseAuth: any) {
  const { deck_id, front_content, back_content } = body;

  // Create new FSRS card for initial scheduling
  const fsrsCard = createEmptyCard();
  const nextReview = fsrsCard.due.toISOString().split("T")[0];

  const { data, error } = await supabaseAuth
    .from("cards")
    .insert({
      deck_id,
      front_content,
      back_content,
      next_review: nextReview,
      interval: 0,
      repetitions: 0,
      ease_factor: 2.5,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get deck info
  const { data: deckData, error: deckError } = await supabaseAuth
    .from("decks")
    .select("deck_name")
    .eq("deck_id", deck_id)
    .single();

  if (deckError || !deckData) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  return NextResponse.json({
    card_id: data.card_id,
    deck_id,
    deck_name: deckData.deck_name,
    front_content,
    back_content,
    next_review: nextReview,
    retrievability: fsrsCard.retrievability,
  });
}

async function handleReviewFlashcard(body: any, supabaseAuth: any) {
  const { card_id, rating } = body;

  // Get current card state
  const { data: cardData, error: cardError } = await supabaseAuth
    .from("cards")
    .select("*")
    .eq("card_id", card_id)
    .single();

  if (cardError || !cardData) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  try {
    // Create FSRS card with current state
    const card = {
      due: new Date(cardData.next_review),
      stability: cardData.interval,
      difficulty: cardData.ease_factor,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: cardData.repetitions,
      lapses: 0,
      state: State.Review,
      last_review: new Date(),
    } as Card;

    // Process the review
    const now = new Date();
    const scheduling_cards = scheduler.repeat(card, now);
    const result = scheduling_cards[rating as Rating];
    const updatedCard = result.card;

    // Update card in database
    const stability = Math.max(0.1, updatedCard.stability);
    const updateData = {
      next_review: updatedCard.due.toISOString().split("T")[0],
      interval: Math.round(stability),
      ease_factor: updatedCard.difficulty,
      last_review_date: now.toISOString().split("T")[0],
      repetitions: updatedCard.reps,
    };

    const { error: updateError } = await supabaseAuth
      .from("cards")
      .update(updateData)
      .eq("card_id", card_id);

    if (updateError) {
      throw updateError;
    }

    // Get deck info
    const { data: deckData, error: deckError } = await supabaseAuth
      .from("decks")
      .select("deck_name")
      .eq("deck_id", cardData.deck_id)
      .single();

    if (deckError || !deckData) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json({
      card_id,
      deck_id: cardData.deck_id,
      deck_name: deckData.deck_name,
      front_content: cardData.front_content,
      back_content: cardData.back_content,
      next_review: updateData.next_review,
      retrievability: updatedCard.retrievability,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function handleGetDueCards(searchParameters: URLSearchParams) {
  const { supabaseAuth } = await getCurrentUser(); // Get authenticated client
  const deck_id = searchParameters.get("deck_id");
  const limit = Number.parseInt(searchParameters.get("limit") || "10");

  const { data, error } = await supabaseAuth // Use supabaseAuth instead of supabase
    .rpc("get_due_cards", {
      p_deck_id: deck_id ? Number.parseInt(deck_id) : null,
      p_limit: limit,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((card: any) => ({
      ...card,
      next_review: new Date().toISOString().split("T")[0],
    })),
  );
}

// Update handleGetDecks to use the user ID directly
async function handleGetDecks(userId: string) {
  const { supabaseAuth } = await getCurrentUser();

  const { data, error } = await supabaseAuth
    .from("decks")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

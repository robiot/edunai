import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  systemPrompt?: string;
}

export async function POST(request: Request) {
  try {
    const data: ChatRequest = await request.json();
    let messages = data.messages || [];

    // Add system prompt if provided
    if (
      data.systemPrompt &&
      (messages.length === 0 || messages[0].role !== "system")
    ) {
      messages = [{ role: "system", content: data.systemPrompt }, ...messages];
    }

    // Use streamText from the AI SDK for simplified streaming
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 },
    );
  }
}

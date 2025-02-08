import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

function getSystemPrompt(): string {
  return "You are a helpful AI assistant focused on education and learning.";
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const messages: Message[] = data.messages || [];

    // Add system prompt if not present
    if (messages.length === 0 || messages[0].role !== "system") {
      messages.unshift({
        role: "system",
        content: getSystemPrompt(),
      });
    }

    // Use streamText from the AI SDK for simplified streaming
    const result = streamText({
      model: openai("gpt-4"),
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

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Type definitions for messages
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Get system prompt - this would typically be imported from a separate file
function getSystemPrompt(): string {
  return `You are a helpful AI assistant focused on education and learning.`;
}

// POST handler for chat endpoint
export async function POST(request: Request) {
  try {
    // Parse the incoming request
    const data = await request.json();
    const messages: Message[] = data.messages || [];

    // Add system prompt if not present
    if (!messages.length || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: getSystemPrompt()
      });
    }

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true,
    });

    // Create a readable stream
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            // Encode and send the chunk
            const text = chunk.choices[0].delta.content;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.close();
      },
    });

    // Return streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    // Handle errors
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
} 
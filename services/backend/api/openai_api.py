from fastapi import FastAPI
from openai import OpenAI
from typing import List, Dict
import os
from .system_prompt import get_system_prompt

# Configure OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def stream_openai_response(messages: List[Dict]):
    """
    Stream the OpenAI chat completion response
    
    Args:
        messages (List[Dict]): List of message dictionaries containing role and content
        
    Yields:
        str: Chunks of the streaming response from OpenAI
    """
    # Add system prompt to the beginning of messages if not already present
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {
            "role": "system",
            "content": get_system_prompt()
        })
    
    # Create streaming completion with OpenAI
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        stream=True,
    )
    
    for chunk in stream:
        if chunk and chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

def init_openai_routes(app: FastAPI):
    """
    Initialize OpenAI routes
    
    Args:
        app (FastAPI): The FastAPI application instance
    """
    from fastapi.responses import StreamingResponse
    from fastapi import Request

    @app.post("/api/chat")
    async def chat_endpoint(request: Request):
        """
        Handle POST requests for chat completions with streaming response
        """
        # Parse the incoming JSON request
        data = await request.json()
        messages = data.get("messages", [])
        
        # Return a streaming response
        return StreamingResponse(
            stream_openai_response(messages),
            media_type="text/event-stream"
        ) 
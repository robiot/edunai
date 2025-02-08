from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from openai import OpenAI
from typing import List, Dict
import json
import os
from dotenv import load_dotenv  # Import load_dotenv to load environment variables

# Load environment variables from .env.local file
load_dotenv('.env.local')  # Specify the path to your .env.local file



# Initialize FastAPI app
app = FastAPI()

# Set maximum duration (note: actual implementation may vary depending on deployment platform)
MAX_DURATION = 30

# Configure OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def stream_openai_response(messages: List[Dict]):
    """
    Stream the OpenAI chat completion response
    """


    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say this is a test"}],
        stream=True,
    )
    
    for chunk in stream:
        if chunk and chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

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

# If running directly (for development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
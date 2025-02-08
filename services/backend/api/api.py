from fastapi import FastAPI
from dotenv import load_dotenv
from .fsrs_api import init_fsrs_routes
from .openai_api import init_openai_routes

# Load environment variables from .env.local file
load_dotenv('.env.local')

# Initialize FastAPI app
app = FastAPI()

# Initialize routes
init_fsrs_routes(app)
init_openai_routes(app)



# If running directly (for development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
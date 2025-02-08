from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, date
from fsrs import Card, Rating, Scheduler
from typing import Optional, List
import json
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

# Load environment variables
load_dotenv('.env.local')

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_PROJECT_URL"),
    os.getenv("SUPABASE_API_KEY")
)

# Initialize the FSRS scheduler with default parameters
scheduler = Scheduler()

# Add this class to handle date serialization
class DateJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle date objects"""
    def default(self, obj):
        if isinstance(obj, date):
            return obj.isoformat()
        return super().default(obj)

class DeckBase(BaseModel):
    """Base model for deck data"""
    deck_id: int
    deck_name: str
    description: Optional[str] = None
    parent_deck_id: Optional[int] = None

class FlashcardBase(BaseModel):
    """Base model for flashcard data"""
    front_content: str
    back_content: str
    deck_id: int

class FlashcardCreate(FlashcardBase):
    """Model for creating a new flashcard"""
    pass

class FlashcardReview(BaseModel):
    """Model for reviewing a flashcard"""
    card_id: int
    rating: int  # 1-4 corresponding to Rating enum

class FlashcardResponse(BaseModel):
    """Model for flashcard response including scheduling info"""
    card_id: int
    deck_id: int
    deck_name: str
    front_content: str
    back_content: str
    next_review: str  # Changed from date to str
    retrievability: Optional[float] = None
    days_overdue: Optional[int] = None

    class Config:
        """Pydantic model configuration"""
        json_encoders = {
            date: lambda v: v.isoformat()
        }

class DeckCreate(BaseModel):
    """Model for creating a new deck"""
    deck_name: str
    description: Optional[str] = None
    parent_deck_id: Optional[int] = None

# Add these at the top with other imports
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and extract user_id"""
    try:
        token = credentials.credentials
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        
        # Add options to handle audience verification
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=["HS256"],
            options={
                "verify_aud": False  # Disable audience verification
            }
        )
        
        user_id = payload.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user id")
        return user_id
    except Exception as e:
        print("JWT decode error:", str(e))  # Add debug logging
        raise HTTPException(status_code=401, detail=str(e))

def init_fsrs_routes(app: FastAPI):
    """Initialize FSRS routes"""
    
    @app.post("/api/decks", response_model=DeckBase)
    async def create_deck(deck: DeckCreate, user_id: str = Depends(get_current_user)):
        """Create a new deck"""
        try:
            result = supabase.table("decks").insert({
                "deck_name": deck.deck_name,
                "description": deck.description,
                "parent_deck_id": deck.parent_deck_id,
                "user_id": user_id  # Add the authenticated user's ID
            }).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create deck")
            
            return result.data[0]
        except Exception as e:
            print("Error creating deck:", str(e))
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/flashcards", response_model=FlashcardResponse)
    async def create_flashcard(flashcard: FlashcardCreate):
        """Create a new flashcard and initialize its FSRS state"""
        # Create new FSRS card for initial scheduling
        fsrs_card = Card()
        
        # Convert date to string for JSON serialization
        next_review = fsrs_card.due.date().isoformat()
        
        # Insert into database
        card_data = {
            "deck_id": flashcard.deck_id,
            "front_content": flashcard.front_content,
            "back_content": flashcard.back_content,
            "next_review": next_review,  # Already a string
            "interval": 0,
            "repetitions": 0,
            "ease_factor": 2.5
        }
        
        result = supabase.table("cards").insert(card_data).execute()
        
        if len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create flashcard")
            
        # Get deck info
        deck = supabase.table("decks").select("deck_name").eq("deck_id", flashcard.deck_id).execute()
        
        return FlashcardResponse(
            card_id=result.data[0]["card_id"],
            deck_id=flashcard.deck_id,
            deck_name=deck.data[0]["deck_name"],
            front_content=flashcard.front_content,
            back_content=flashcard.back_content,
            next_review=next_review,  # Already a string
            retrievability=fsrs_card.get_retrievability()
        )

    @app.post("/api/flashcards/{card_id}/review", response_model=FlashcardResponse)
    async def review_flashcard(card_id: int, review: FlashcardReview):
        """Review a flashcard and get next review time"""
        # Get current card state
        card_result = supabase.table("cards").select("*").eq("card_id", card_id).execute()
        
        if len(card_result.data) == 0:
            raise HTTPException(status_code=404, detail="Flashcard not found")
            
        card_data = card_result.data[0]
        
        try:
            # Convert rating integer to Rating enum
            rating = Rating(review.rating)
            
            # Convert the string date to a datetime.date object
            next_review_date = datetime.strptime(card_data["next_review"], "%Y-%m-%d").date()
            
            # Create FSRS card with current state
            card = Card(
                due=datetime.combine(next_review_date, datetime.min.time(), tzinfo=timezone.utc),
                stability=card_data["interval"],
                difficulty=card_data["ease_factor"],
                state=2,  # Review state
                last_review=datetime.now(timezone.utc)
            )
            
            # Process the review
            updated_card, review_log = scheduler.review_card(card, rating)
            
            # Update card in database - ensure stability is never zero
            stability = max(0.1, updated_card.stability)  # Set minimum stability to 0.1
            update_data = {
                "next_review": updated_card.due.date().isoformat(),
                "interval": int(round(stability)),  # Convert float to integer
                "ease_factor": updated_card.difficulty,
                "last_review_date": datetime.now(timezone.utc).date().isoformat()
            }
            
            result = supabase.table("cards").update(update_data).eq("card_id", card_id).execute()
            
            # Get deck info
            deck = supabase.table("decks").select("deck_name").eq("deck_id", card_data["deck_id"]).execute()
            
            # Safely calculate retrievability
            try:
                retrievability = updated_card.get_retrievability()
            except (ZeroDivisionError, ValueError):
                retrievability = 0.0  # Default value when calculation fails
            
            return FlashcardResponse(
                card_id=card_id,
                deck_id=card_data["deck_id"],
                deck_name=deck.data[0]["deck_name"],
                front_content=card_data["front_content"],
                back_content=card_data["back_content"],
                next_review=updated_card.due.date().isoformat(),
                retrievability=retrievability
            )
            
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid rating. Must be between 1 and 4"
            )

    @app.get("/api/flashcards/due", response_model=List[FlashcardResponse])
    async def get_due_flashcards(deck_id: Optional[int] = None, limit: int = 10):
        """Get all flashcards that are due for review"""
        # Use the custom SQL function
        query = """
        SELECT * FROM get_due_cards($1, $2)
        """
        result = supabase.rpc('get_due_cards', params={'p_deck_id': deck_id, 'p_limit': limit}).execute()
        
        return [
            FlashcardResponse(
                card_id=card["card_id"],
                deck_id=card["deck_id"],
                deck_name=card["deck_name"],
                front_content=card["front_content"],
                back_content=card["back_content"],
                next_review=datetime.now(timezone.utc).date().isoformat(),  # Convert date to string
                days_overdue=card["days_overdue"]
            )
            for card in result.data
        ]

    @app.get("/api/decks", response_model=List[DeckBase])
    async def get_decks():
        """Get all decks"""
        result = supabase.table("decks").select("*").execute()
        return result.data 
from fastapi import APIRouter, HTTPException, Header, Body
from typing import Optional, List
from app.core.config import settings
import httpx
import logging
from pydantic import BaseModel
from collections import defaultdict
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# System prompt - SINGLE PLACE TO ADJUST ASSISTANT PERSONA
# This grounds the assistant in NutriWasteAI context while allowing general-purpose conversation
SYSTEM_PROMPT = """You are the Enquiry Agent for NutriWasteAI, a platform for food-waste valorization, nutritional assessment, and value-added product recommendation. 

Answer any question the user has — about the platform, food science, nutrition, sustainability, or general topics — clearly and conversationally, the way a knowledgeable, friendly assistant would.

If asked specifically about how NutriWasteAI works:
- Manual Entry: Users enter sample details (name, source type, nutritional values like protein, fat, fibre, carbohydrate, ash, moisture) for analysis
- Image Capture: Users upload photos of food waste samples; the system assists with identification and provides nutritional input fields
- Trial vs Login: Trial mode allows unlimited analyses but doesn't save to history or allow PDF downloads. Logged-in users can save analyses, access history, and download PDF reports.
- History: Logged-in users can view past analyses with detailed nutritional data and product recommendations
- PDF Export: Users can download comprehensive reports with nutritional composition, product recommendations, and processing methods

You are not limited to platform questions — engage naturally with anything the user asks, whether it's about food science, sustainability, general knowledge, or casual conversation. Be helpful, concise, and conversational."""

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []

# Simple in-memory rate limiting (for production, use Redis or similar)
class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        now = datetime.now()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        # Clean old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier] 
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) < self.max_requests:
            self.requests[identifier].append(now)
            return True
        return False

rate_limiter = RateLimiter(
    max_requests=settings.CHAT_RATE_LIMIT_PER_MINUTE,
    window_seconds=60
)

@router.post("/chat")
async def chat_with_groq(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Groq API integration for general-purpose conversational chatbot.
    Uses Groq's free OpenAI-compatible API with llama-3.3-70b-versatile model.
    """
    try:
        # Check API key
        if not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Groq API key not configured. Please set GROQ_API_KEY in environment variables."
            )
        
        # Simple rate limiting (use session ID or IP as identifier)
        session_id = authorization or "anonymous"
        if not rate_limiter.is_allowed(session_id):
            raise HTTPException(
                status_code=429,
                detail="I'm getting a lot of questions right now — please try again in a moment."
            )
        
        # Prepare conversation history for Groq API (OpenAI-compatible format)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add conversation history if provided
        if request.conversation_history:
            for msg in request.conversation_history:
                if msg.get("role") in ["user", "assistant"]:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # Call Groq API (OpenAI-compatible endpoint)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "messages": messages,
                        "max_tokens": settings.GROQ_MAX_TOKENS,
                        "temperature": 0.7,
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    # Extract response text from OpenAI-compatible format
                    response_text = data["choices"][0]["message"]["content"]
                    
                    logger.info(f"Groq API response received, length: {len(response_text)}")
                    
                    return {"response": response_text}
                    
                elif response.status_code == 429:
                    logger.error(f"Groq API rate limit exceeded: {response.text}")
                    raise HTTPException(
                        status_code=429,
                        detail="I'm getting a lot of questions right now — please try again in a moment."
                    )
                else:
                    logger.error(f"Groq API returned status {response.status_code}: {response.text}")
                    raise HTTPException(
                        status_code=503,
                        detail="I'm having trouble connecting right now. Please try again later."
                    )
                    
        except httpx.TimeoutException:
            logger.error("Groq API request timed out")
            raise HTTPException(
                status_code=503,
                detail="The request took too long. Please try again."
            )
        except httpx.ConnectError:
            logger.error("Could not connect to Groq API")
            raise HTTPException(
                status_code=503,
                detail="I'm having trouble connecting right now. Please try again later."
            )
        except Exception as e:
            logger.error(f"Unexpected Groq API error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while processing your request."
            )
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred processing your request."
        )
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Review, FoodItem
from ..schemas import ReviewCreate, ReviewResponse
from ..dependencies import get_current_active_user

# Mock function for sentiment analysis before implementing AI module
def analyze_sentiment(text: str) -> str:
    # A placeholder. We will import the real ML model later.
    if not text:
        return "Neutral"
    text = text.lower()
    if any(word in text for word in ["good", "great", "excellent", "amazing", "delicious", "love"]):
        return "Positive"
    elif any(word in text for word in ["bad", "terrible", "awful", "worst", "hate"]):
        return "Negative"
    return "Neutral"

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/", response_model=ReviewResponse)
def create_review(food_id: int, review: ReviewCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    food = db.query(FoodItem).filter(FoodItem.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
        
    sentiment_result = analyze_sentiment(review.comment)
    
    new_review = Review(
        user_id=current_user.id,
        food_item_id=food_id,
        rating=review.rating,
        comment=review.comment,
        sentiment=sentiment_result
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/food/{food_id}", response_model=List[ReviewResponse])
def get_food_reviews(food_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.food_item_id == food_id).order_by(Review.created_at.desc()).all()

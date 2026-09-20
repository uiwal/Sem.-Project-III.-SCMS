from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

from ..database import get_db
from ..models import Order, OrderItem, FoodItem, Review
from ..dependencies import get_current_active_user, get_current_staff_or_admin

router = APIRouter(prefix="/ai", tags=["AI & ML Analytics"])

@router.get("/recommendations", response_model=List[Dict])
def get_food_recommendations(db: Session = Depends(get_db)):
    # Simple Recommendation Engine: 
    # Weighted score of average rating (70%) and total times ordered (30%)
    
    # Get all food items
    foods = db.query(FoodItem).all()
    recommendations = []
    
    for food in foods:
        # Calculate avg rating
        reviews = db.query(Review).filter(Review.food_item_id == food.id).all()
        avg_rating = np.mean([r.rating for r in reviews]) if reviews else 3.0
        
        # Calculate order popularity
        order_count = db.query(OrderItem).filter(OrderItem.food_item_id == food.id).count()
        
        # Arbitrary scoring mechanism for AI demo
        score = (avg_rating * 0.7) + (min(order_count, 50) / 50.0 * 5.0 * 0.3)
        
        recommendations.append({
            "food_id": food.id,
            "name": food.name,
            "score": round(score, 2),
            "avg_rating": round(avg_rating, 2),
            "image_url": food.image_url,
            "price": food.price
        })
        
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:5]

@router.get("/demand-prediction", response_model=Dict)
def predict_demand(db: Session = Depends(get_db), current_user = Depends(get_current_staff_or_admin)):
    # Predict total orders for the next 7 days based on past days' trend using Linear Regression
    orders = db.query(Order).all()
    if not orders:
        return {"labels": [], "predicted": []}
        
    df = pd.DataFrame([{"date": o.created_at.date(), "count": 1} for o in orders])
    daily_orders = df.groupby('date').count().reset_index()
    
    # We need at least 3 dates 
    if len(daily_orders) < 3:
        return {"error": "Not enough historical data for demand prediction"}
        
    # Convert dates to ordinal for regression
    daily_orders['date_ordinal'] = pd.to_datetime(daily_orders['date']).apply(lambda date: date.toordinal())
    
    X = daily_orders[['date_ordinal']]
    y = daily_orders['count']
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next 7 days
    last_date = pd.to_datetime(daily_orders['date'].max())
    future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, 8)]
    future_ordinals = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
    
    predictions = model.predict(future_ordinals)
    
    # Return dates and non-negative rounded predictions
    return {
        "labels": [d.strftime('%Y-%m-%d') for d in future_dates],
        "predicted": [max(0, int(round(p))) for p in predictions]
    }

@router.get("/wait-time")
def predict_wait_time(db: Session = Depends(get_db)):
    # Estimated waiting time model based on current 'Pending' and 'Preparing' orders
    pending_orders = db.query(Order).filter(Order.status.in_(["Pending", "Preparing"])).all()
    
    if not pending_orders:
        return {"estimated_wait_minutes": 5}
        
    total_prep_time = 0
    for order in pending_orders:
        for item in order.items:
            # sum prep times. In reality, parallel preparation happens.
            total_prep_time += (item.food_item.prep_time_mins or 10) * item.quantity
            
    # Simple heuristic: Assuming 3 chefs working simultaneously (divide by 3)
    estimated = max(5, int(total_prep_time / 3))
    
    return {"estimated_wait_minutes": estimated}

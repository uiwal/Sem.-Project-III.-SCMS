from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import Order, OrderItem, FoodItem, OrderStatus, Payment
from ..schemas import OrderCreate, OrderResponse, OrderStatus as OrderStatusSchema
from ..dependencies import get_current_active_user, get_current_staff_or_admin

router = APIRouter(prefix="/orders", tags=["Orders"])

import uuid

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    total_amount = 0.0
    order_items_db = []
    
    for item in order.items:
        food = db.query(FoodItem).filter(FoodItem.id == item.food_item_id).first()
        if not food:
            raise HTTPException(status_code=400, detail=f"Food item {item.food_item_id} not found")
        total_amount += food.price * item.quantity
        order_items_db.append(
            OrderItem(food_item_id=food.id, quantity=item.quantity, price_at_time=food.price)
        )
    
    qr_code_str = f"order-{current_user.id}-{uuid.uuid4().hex[:8]}"
    
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status=OrderStatus.pending,
        qr_code=qr_code_str
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    for o_item in order_items_db:
        o_item.order_id = new_order.id
        db.add(o_item)
        
    new_payment = Payment(
        order_id=new_order.id,
        amount=total_amount,
        payment_method=order.payment_method,
        status="Completed",
        transaction_id=f"TXN-{uuid.uuid4().hex[:10]}"
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_order) # Reload with relations
    
    return new_order

@router.get("/my", response_model=List[OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/all", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db), current_user = Depends(get_current_staff_or_admin)):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(get_current_staff_or_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    if status == OrderStatus.ready:
        order.pickup_time = datetime.utcnow()
        
    db.commit()
    db.refresh(order)
    return order

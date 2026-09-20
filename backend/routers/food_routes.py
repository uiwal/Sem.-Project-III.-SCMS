from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Category, FoodItem, Inventory
from ..schemas import CategoryBase, CategoryResponse, FoodItemBase, FoodItemResponse
from ..dependencies import get_current_staff_or_admin, get_current_active_user

router = APIRouter(prefix="/food", tags=["Food"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryBase, db: Session = Depends(get_db), current_user = Depends(get_current_staff_or_admin)):
    db_cat = Category(**category.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.get("/items", response_model=List[FoodItemResponse])
def get_food_items(category_id: int = None, db: Session = Depends(get_db)):
    query = db.query(FoodItem)
    if category_id:
        query = query.filter(FoodItem.category_id == category_id)
    return query.all()

@router.post("/items", response_model=FoodItemResponse)
def create_food_item(item: FoodItemBase, db: Session = Depends(get_db), current_user = Depends(get_current_staff_or_admin)):
    db_item = FoodItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # Init inventory
    db_inv = Inventory(food_item_id=db_item.id, stock_quantity=100)
    db.add(db_inv)
    db.commit()
    
    return db_item

@router.get("/items/{item_id}", response_model=FoodItemResponse)
def get_food_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoodItem).filter(FoodItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return item

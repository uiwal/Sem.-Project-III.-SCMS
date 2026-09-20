from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .models import RoleEnum, OrderStatus

# Users
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    created_at: datetime
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Categories
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        orm_mode = True

# Food Items
class FoodItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: bool = True
    prep_time_mins: int = 10
    category_id: int

class FoodItemResponse(FoodItemBase):
    id: int
    class Config:
        orm_mode = True

# Cart
class CartItemCreate(BaseModel):
    food_item_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    food_item_id: int
    quantity: int
    food_item: FoodItemResponse
    class Config:
        orm_mode = True

# Orders
class OrderItemResponse(BaseModel):
    id: int
    food_item_id: int
    quantity: int
    price_at_time: float
    food_item: FoodItemResponse
    class Config:
        orm_mode = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    pickup_time: Optional[datetime] = None
    qr_code: Optional[str] = None
    items: List[OrderItemResponse] = []
    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    items: List[CartItemCreate]
    payment_method: str = "UPI"

# Payment
class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    payment_method: str
    status: str
    transaction_id: Optional[str]
    created_at: datetime
    class Config:
        orm_mode = True

# Reviews
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    food_item_id: int
    sentiment: Optional[str] = None
    created_at: datetime
    user: UserBase
    class Config:
        orm_mode = True

# Inventory
class InventoryResponse(BaseModel):
    id: int
    food_item_id: int
    stock_quantity: int
    low_stock_threshold: int
    food_item: FoodItemResponse
    class Config:
        orm_mode = True

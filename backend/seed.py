import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import User, Category, FoodItem, Inventory, Review, Order, OrderItem
from backend.auth import get_password_hash
from datetime import datetime, timedelta
import random

def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Seeding database (forced reset)...")
        
    # Seed Users
    admin = User(name="Admin User", email="admin@campusbite.com", hashed_password=get_password_hash("admin123"), role="admin")
    staff = User(name="Staff Member", email="staff@campusbite.com", hashed_password=get_password_hash("staff123"), role="staff")
    student = User(name="Student One", email="student@example.com", hashed_password=get_password_hash("student123"), role="student")
    
    db.add_all([admin, staff, student])
    db.commit()
    
    # Seed Categories
    cat1 = Category(name="Beverages", description="Cold and hot drinks")
    cat2 = Category(name="Snacks", description="Quick bites and snacks")
    cat3 = Category(name="Meals", description="Heavy lunch and dinner meals")
    cat4 = Category(name="Desserts", description="Sweet treats and chocolates")
    cat_combo = Category(name="🔥 Combos", description="Special Combo Deals")
    db.add_all([cat1, cat2, cat3, cat4, cat_combo])
    db.commit()
    
    # Seed Food Items
    foods = [
        FoodItem(name="Cold Coffee", price=50.0, category_id=cat1.id, prep_time_mins=5, image_url="/images/cold_coffee.png"),
        FoodItem(name="Masala Chai", price=15.0, category_id=cat1.id, prep_time_mins=5, image_url="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300"),
        FoodItem(name="Cold Drink", price=40.0, category_id=cat1.id, prep_time_mins=2, image_url="/images/cold_drink.png"),
        FoodItem(name="Samosa", price=20.0, category_id=cat2.id, prep_time_mins=0, image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300"),
        FoodItem(name="Paneer Tikka Roll", price=80.0, category_id=cat2.id, prep_time_mins=10, image_url="/images/paneer_tikka_roll.png"),
        FoodItem(name="Tasty Snack Platter", price=60.0, category_id=cat2.id, prep_time_mins=5, image_url="/images/tasty_snack.png"),
        FoodItem(name="Veg Thali", price=120.0, category_id=cat3.id, prep_time_mins=15, image_url="https://plus.unsplash.com/premium_photo-1694141253763-209b4c8f8ace?w=300"),
        FoodItem(name="Chicken Biryani", price=160.0, category_id=cat3.id, prep_time_mins=20, image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300"),
        FoodItem(name="Hot Pizza", price=150.0, category_id=cat3.id, prep_time_mins=15, image_url="/images/hot_pizza.png"),
        FoodItem(name="Chocolate Dessert", price=90.0, category_id=cat4.id, prep_time_mins=5, image_url="/images/chocolate_dessert.png"),
        FoodItem(name="Sweet Cake", price=110.0, category_id=cat4.id, prep_time_mins=10, image_url="/images/sweet_cake.png"),
        
        # New Individual Items
        FoodItem(name="Vada Pav", price=15.0, category_id=cat2.id, prep_time_mins=5, image_url="/images/vada_pav.png"),
        FoodItem(name="Poha", price=25.0, category_id=cat2.id, prep_time_mins=5, image_url="/images/poha.png"),
        FoodItem(name="Sandwich", price=35.0, category_id=cat2.id, prep_time_mins=5, image_url="/images/sandwich.png"),
        FoodItem(name="Burger", price=55.0, category_id=cat2.id, prep_time_mins=10, image_url="/images/burger.png"),

        # Combos
        FoodItem(name="Tea + Samosa", price=30.0, category_id=cat_combo.id, prep_time_mins=2, description="Hot tea with crispy samosa", image_url="/images/tea_samosa.png"),
        FoodItem(name="Tea + Poha", price=30.0, category_id=cat_combo.id, prep_time_mins=2, description="Hot tea with fresh poha", image_url="/images/tea_poha.png"),
        FoodItem(name="Vada Pav + Tea", price=25.0, category_id=cat_combo.id, prep_time_mins=2, description="Mumbai-style vada pav with hot tea", image_url="/images/vada_pav_tea.png"),
    ]
    db.add_all(foods)
    db.commit()
    
    for f in foods:
        db.add(Inventory(food_item_id=f.id, stock_quantity=50))
    db.commit()
    
    # Seed historical orders with random dates for ML
    for i in range(40):
        days_ago = random.randint(1, 15)
        dt = datetime.utcnow() - timedelta(days=days_ago)
        
        f = random.choice(foods)
        q = random.randint(1, 3)
        total = f.price * q
        
        o = Order(user_id=student.id, total_amount=total, status="Completed", created_at=dt, qr_code=f"xyz{i}")
        db.add(o)
        db.commit()
        db.refresh(o)
        
        oi = OrderItem(order_id=o.id, food_item_id=f.id, quantity=q, price_at_time=f.price)
        db.add(oi)
        db.commit()
        
        # Add random reviews
        if random.random() > 0.3:
            rat = random.randint(3, 5)
            rev = Review(user_id=student.id, food_item_id=f.id, rating=rat, comment="Tasted good!", sentiment="Positive", created_at=dt)
            db.add(rev)
            db.commit()

    print("Success. Default logins:")
    print("admin@campusbite.com / admin123")
    print("staff@campusbite.com / staff123")
    print("student@example.com / student123")
    
if __name__ == "__main__":
    seed_db()

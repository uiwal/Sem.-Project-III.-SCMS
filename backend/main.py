from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth_routes, food_routes, orders_routes, reviews_routes, ai_routes

# Initialize DB tables (SQLite fallback)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusBite AI API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api")
app.include_router(food_routes.router, prefix="/api")
app.include_router(orders_routes.router, prefix="/api")
app.include_router(reviews_routes.router, prefix="/api")
app.include_router(ai_routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "CampusBite AI API is running"}

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Try MySQL first (default XAMPP/WAMP root no password), fallback to SQLite if MySQL fails
MYSQL_URL = "mysql+pymysql://root:@localhost/campusbite"
SQLITE_URL = "sqlite:///./campusbite.db"

# We'll default to SQLite right now for guaranteed runnability without manual DB creation
# For a full MySQL setup the user must create the 'campusbite' scheme manually.
SQLALCHEMY_DATABASE_URL = SQLITE_URL

# For sqlite we need check_same_thread=False
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

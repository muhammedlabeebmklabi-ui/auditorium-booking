import os
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

# ---------------------------------------------------------
# 1. DATABASE CONFIGURATION (Supabase PostgreSQL)
# ---------------------------------------------------------
# ശ്രദ്ധിക്കുക: [YOUR-PASSWORD] എന്ന ഭാഗത്ത് നിങ്ങളുടെ Supabase Password നൽകുക
DATABASE_URL = "postgresql+psycopg2://postgres.hncquixitkpllypdulfk:9846573871labeeb@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# 2. DATABASE MODELS (Tables)
# ---------------------------------------------------------
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    bookings = relationship("BookingDB", back_populates="user")

class AuditoriumDB(Base):
    __tablename__ = "auditoriums"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    price_per_day = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)

    bookings = relationship("BookingDB", back_populates="auditorium")

class BookingDB(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    auditorium_id = Column(Integer, ForeignKey("auditoriums.id"), nullable=False)
    booking_date = Column(String, nullable=False)
    status = Column(String, default="Confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserDB", back_populates="bookings")
    auditorium = relationship("AuditoriumDB", back_populates="bookings")

# Create all tables in Supabase
# Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# 3. FASTAPI SETUP & CORS CONFIGURATION
# ---------------------------------------------------------
app = FastAPI(title="Auditorium Booking API")

# Allow requests from React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production-ൽ വേണമെങ്കിൽ ഫ്രണ്ട് എന്റ് URL മാത്രം നൽകാം
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 4. PYDANTIC SCHEMAS (Request/Response Validation)
# ---------------------------------------------------------
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class AuditoriumCreate(BaseModel):
    name: str
    location: str
    capacity: int
    price_per_day: float
    image_url: Optional[str] = None

class AuditoriumResponse(AuditoriumCreate):
    id: int

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    user_id: int
    auditorium_id: int
    booking_date: str

class BookingResponse(BaseModel):
    id: int
    user_id: int
    auditorium_id: int
    booking_date: str
    status: str

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# 5. API ROUTES / ENDPOINTS
# ---------------------------------------------------------
@app.get("/")
def root():
    return {"message": "Auditorium Booking API with Supabase PostgreSQL is running!"}

# --- USER ROUTES ---
@app.post("/api/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = UserDB(name=user.name, email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- AUDITORIUM ROUTES ---
@app.get("/api/auditoriums", response_model=List[AuditoriumResponse])
def get_auditoriums(db: Session = Depends(get_db)):
    return db.query(AuditoriumDB).all()

@app.post("/api/auditoriums", response_model=AuditoriumResponse)
def add_auditorium(audito: AuditoriumCreate, db: Session = Depends(get_db)):
    new_audito = AuditoriumDB(**audito.dict())
    db.add(new_audito)
    db.commit()
    db.refresh(new_audito)
    return new_audito

# --- BOOKING ROUTES ---
@app.post("/api/bookings", response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    # Check if auditorium is already booked on that date
    existing_booking = db.query(BookingDB).filter(
        BookingDB.auditorium_id == booking.auditorium_id,
        BookingDB.booking_date == booking.booking_date
    ).first()

    if existing_booking:
        raise HTTPException(status_code=400, detail="Auditorium already booked for this date")

    new_booking = BookingDB(**booking.dict())
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@app.get("/api/bookings", response_model=List[BookingResponse])
def get_all_bookings(db: Session = Depends(get_db)):
    return db.query(BookingDB).all()
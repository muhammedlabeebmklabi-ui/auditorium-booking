from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS Settings (Front-end മായി കണക്റ്റ് ചെയ്യാൻ)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bookings_db = []
id_counter = 1

class BookingSchema(BaseModel):
    auditorium: str
    booking_date: str
    time: str
    notes: Optional[str] = ""
    status: str = "confirmed"

class BookingResponseSchema(BookingSchema):
    id: int

@app.get("/api/bookings", response_model=List[BookingResponseSchema])
def get_bookings():
    return bookings_db

@app.post("/api/bookings", response_model=BookingResponseSchema)
def create_booking(booking: BookingSchema):
    global id_counter
    new_booking = booking.dict()
    new_booking["id"] = id_counter
    id_counter += 1
    bookings_db.append(new_booking)
    return new_booking

@app.delete("/api/bookings/{booking_id}")
def delete_booking(booking_id: int):
    global bookings_db
    bookings_db = [b for b in bookings_db if b["id"] != booking_id]
    return {"message": "Booking deleted successfully"}
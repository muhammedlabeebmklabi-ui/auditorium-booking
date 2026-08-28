from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("bookings.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auditorium TEXT,
            date TEXT,
            time TEXT,
            notes TEXT,
            status TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

class Booking(BaseModel):
    auditorium: str
    date: str
    time: str
    notes: Optional[str] = ""
    status: Optional[str] = "confirmed"

@app.get("/bookings")
def get_bookings():
    conn = sqlite3.connect("bookings.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, auditorium, date, time, notes, status FROM bookings")
    rows = cursor.fetchall()
    conn.close()
    
    bookings = []
    for row in rows:
        bookings.append({
            "id": row[0],
            "auditorium": row[1],
            "date": row[2],
            "time": row[3],
            "notes": row[4],
            "status": row[5]
        })
    return bookings

@app.post("/bookings")
def create_booking(booking: Booking):
    conn = sqlite3.connect("bookings.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO bookings (auditorium, date, time, notes, status) VALUES (?, ?, ?, ?, ?)",
        (booking.auditorium, booking.date, booking.time, booking.notes, booking.status)
    )
    conn.commit()
    conn.close()
    return {"message": "Booking created successfully"}

# ----------------------------------------------------
# 🔻 ഡിലീറ്റ് ചെയ്യാനുള്ള API (ഈ കോഡ് ബാക്ക് എന്റിൽ ഉണ്ടെന്ന് ഉറപ്പാക്കുക)
# ----------------------------------------------------
@app.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int):
    conn = sqlite3.connect("bookings.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    conn.commit()
    conn.close()
    return {"message": "Booking deleted successfully"}
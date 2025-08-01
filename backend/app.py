import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import Response
from flask import Flask, jsonify, request
from flask_cors import CORS

from fastapi import FastAPI, HTTPException, Request, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import asyncio
import uvicorn


class LoginRequest(BaseModel):
    user_id: str
    email: str
    password: str

DATABASE_PATH = os.environ.get("ECHO_DB", os.path.join(os.path.dirname(__file__), "echo.db"))

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS auth_data (
                user_id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                password TEXT
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                streak_count INTEGER,
                last_entry_date TEXT,
                FOREIGN KEY (user_id) REFERENCES auth_data(user_id) ON DELETE CASCADE
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                timestamp TEXT,
                mood TEXT,
                mood_intensity INTEGER,
                text TEXT,
                spotify_track_id TEXT,
                shared_to TEXT,
                liked_tracks TEXT,
                FOREIGN KEY (user_id) REFERENCES auth_data(user_id) ON DELETE CASCADE
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                currentDate TEXT,
                expiryDate TEXT,
                FOREIGN KEY (user_id) REFERENCES auth_data(user_id) ON DELETE CASCADE
);
            """
        )


        conn.commit()

def parse_date(date_str: str) -> datetime.date:
    return datetime.fromisoformat(date_str).date()

def update_streak(user_id: str, entry_date: datetime.date) -> None:
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT streak_count, last_entry_date FROM users WHERE user_id = ?", (user_id,)
        )
        row = cur.fetchone()
        if row:
            streak = row["streak_count"] or 0
            last_date_str = row["last_entry_date"]
            last_date = parse_date(last_date_str) if last_date_str else None
            if last_date is not None:
                if entry_date == last_date:
                    return
                if entry_date == last_date + timedelta(days=1):
                    streak += 1
                else:
                    streak = 1
            else:
                streak = 1
            conn.execute(
                "UPDATE users SET streak_count = ?, last_entry_date = ? WHERE user_id = ?",
                (streak, entry_date.isoformat(), user_id),
            )
        else:
            conn.execute(
                "INSERT INTO users (user_id, streak_count, last_entry_date) VALUES (?, ?, ?)",
                (user_id, 1, entry_date.isoformat()),
            )
        conn.commit()

def to_entry_dict(row: sqlite3.Row) -> Dict[str, Any]:
    shared_to = json.loads(row["shared_to"] or "[]") if "shared_to" in row.keys() else []
    liked_tracks = json.loads(row["liked_tracks"] or "[]") if "liked_tracks" in row.keys() else []
    return {
        "entry_id": row["id"],
        "user_id": row["user_id"],
        "timestamp": row["timestamp"],
        "mood": row["mood"],
        "mood_intensity": row["mood_intensity"],
        "text": row["text"],
        "spotify_track_id": row["spotify_track_id"],
        "shared_to": shared_to,
        "liked_tracks": liked_tracks,
    }

app = Flask(__name__)
CORS(app)

init_db()



app = FastAPI(
    title="EchoReal API",
    description="API for EchoReal journaling and music recommendation app.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JournalEntryCreate(BaseModel):
    user_id: str
    mood: str
    text: str
    mood_intensity: Optional[int] = None
    spotify_track_id: Optional[str] = None

class JournalEntryUpdate(BaseModel):
    mood: Optional[str] = None
    mood_intensity: Optional[int] = None
    text: Optional[str] = None

class ShareRequest(BaseModel):
    entry_id: int
    recipients: List[str]

class AttachSongRequest(BaseModel):
    track_id: str

@app.post("/journal/entries", status_code=201)
async def create_entry(entry: JournalEntryCreate):
    if not entry.user_id or not entry.mood or entry.text is None:
        raise HTTPException(status_code=400, detail="user_id, mood and text are required")
    now = datetime.utcnow()
    ts_str = now.isoformat()
    shared_to_json = json.dumps([])
    liked_tracks_json = json.dumps([])
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO journal_entries (user_id, timestamp, mood, mood_intensity, text, spotify_track_id, shared_to, liked_tracks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry.user_id,
                ts_str,
                entry.mood,
                entry.mood_intensity,
                entry.text,
                entry.spotify_track_id,
                shared_to_json,
                liked_tracks_json,
            ),
        )
        entry_id = cur.lastrowid
        conn.commit()
    update_streak(entry.user_id, now.date())
    return {"entry_id": entry_id, "status": "created"}

@app.get("/journal/entries")
async def list_entries(user_id: Optional[str] = Query(None)):
    query = "SELECT * FROM journal_entries"
    params: List[Any] = []
    if user_id:
        query += " WHERE user_id = ?"
        params.append(user_id)
    query += " ORDER BY datetime(timestamp) DESC"
    with get_connection() as conn:
        cur = conn.execute(query, params)
        rows = cur.fetchall()
    entries = [to_entry_dict(row) for row in rows]
    return entries

@app.get("/journal/entries/{entry_id}")
async def get_entry(entry_id: int):
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
        row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return to_entry_dict(row)

@app.patch("/journal/entries/{entry_id}")
@app.put("/journal/entries/{entry_id}")
async def update_entry(entry_id: int, entry: JournalEntryUpdate):
    allowed = {"mood", "mood_intensity", "text"}
    updates = {k: v for k, v in entry.dict(exclude_unset=True).items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No updatable fields provided")
    sets = ", ".join(f"{k} = ?" for k in updates.keys())
    params = list(updates.values()) + [entry_id]
    with get_connection() as conn:
        cur = conn.execute(f"UPDATE journal_entries SET {sets} WHERE id = ?", params)
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        conn.commit()
    return {"status": "updated"}

@app.delete("/journal/entries/{entry_id}")
async def delete_entry(entry_id: int):
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        conn.commit()
    return {"status": "deleted"}

@app.post("/journal/entries/{entry_id}/attach-song")
async def attach_song(entry_id: int, req: AttachSongRequest):
    if not req.track_id:
        raise HTTPException(status_code=400, detail="track_id is required")
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE journal_entries SET spotify_track_id = ? WHERE id = ?",
            (req.track_id, entry_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        conn.commit()
    return {"status": "attached"}

@app.get("/journal/entries/user-latest/{user_id}")
async def get_song(user_id: str):
    now = datetime.utcnow()
    ts_str = now.isoformat()

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    with get_connection() as conn:
        print(ts_str)
        cur = conn.execute("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
        row = cur.fetchone()
    
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return to_entry_dict(row)

@app.get("/recommendations")
async def recommendations():
    songs = [
        {
            "track_id": "spotify:track:7ouMYWpwJ422jRcDASZB7P",
            "title": "Happier",
            "artist": "Marshmello",
            "mood": "positive",
        },
        {
            "track_id": "spotify:track:3tjFYV6RSFtuktYl3ZtYcq",
            "title": "Someone Like You",
            "artist": "Adele",
            "mood": "sad",
        },
        {
            "track_id": "spotify:track:4VqPOruhp5EdPBeR92t6lQ",
            "title": "Fix You",
            "artist": "Coldplay",
            "mood": "hopeful",
        },
    ]
    return {"songs": songs}

@app.post("/share")
async def share(req: ShareRequest):
    entry_id = req.entry_id
    recipients = req.recipients
    if not entry_id or not recipients:
        raise HTTPException(status_code=400, detail="entry_id and recipients are required")
    with get_connection() as conn:
        cur = conn.execute("SELECT shared_to FROM journal_entries WHERE id = ?", (entry_id,))
        row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Entry not found")
        current_recipients = json.loads(row["shared_to"] or "[]")
        for r in recipients:
            if r not in current_recipients:
                current_recipients.append(r)
        conn.execute(
            "UPDATE journal_entries SET shared_to = ? WHERE id = ?",
            (json.dumps(current_recipients), entry_id),
        )
        conn.commit()
    return {"status": "shared"}

@app.get("/users/{user_id}/streak")
async def get_streak(user_id: str):
    with get_connection() as conn:
        cur = conn.execute("SELECT streak_count FROM users WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
    streak = row["streak_count"] if row else 0
    return {"streak_count": streak}

@app.get("/users")
async def get_user():
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM users ")
        cur_rows = cur.fetchall()
    users = []
    for row in cur_rows:
        users.append({
            "user_id": row["user_id"],
            "streak_count": row["streak_count"],
            "last_entry_date": row["last_entry_date"]
        })
    return {"result": users}

@app.post("/users/{user_id}", status_code=201)
async def create_user(user_id: str):
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO users (user_id, streak_count, last_entry_date) VALUES (?, 0, NULL)",
            (user_id,)
        )
        conn.commit()
    if cur.rowcount == 0:
        raise HTTPException(status_code=400, detail="User already exists")
    return {"status": "created"}

@app.get("/users/get/{user_id}")
async def get_user_byid(user_id: str):
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        )
        cur = cur.fetchone()
    if cur is None:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = {
        "user_id": cur["user_id"],
        "streak_count": cur["streak_count"],
        "last_entry_date": cur["last_entry_date"]
    }
    return {"res": user_data}

@app.get("/genius/generate")
async def genius_generate(user_id: str = Query(...)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    global text
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY timestamp DESC", (user_id,))
        row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    text = row["text"]
    if not text:
        raise HTTPException(status_code=400, detail="No text found in entry")
    from lib.matcher import match
    from lib.semantics import ana
    result = match(text, ana)
    return {"result": result}

@app.get("/session/create/{user_id}", status_code=201)
async def create_session(user_id: str):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * from sessions where user_id = ?", (user_id,))
        existing_session = cur.fetchone()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO sessions (user_id, currentDate, expiryDate) VALUES (?,?,?)", (user_id, datetime.utcnow().isoformat(), (datetime.utcnow() + timedelta(days=30)).isoformat()))
        conn.commit()
    return {"status": "session created", "session": {
        "user_id": user_id,
        "currentDate": datetime.utcnow().isoformat(),
        "expiryDate": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }}

@app.get("/session/validate/{user_id}")
async def validate_session(user_id: str):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * from sessions where user_id = ?", (user_id,))
        session = cur.fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    current_date = datetime.utcnow()
    expiry_date = datetime.fromisoformat(session["expiryDate"])
    if current_date > expiry_date:
        raise HTTPException(status_code=403, detail="Session expired")
    return {"status": "session valid", "session": {
        "user_id": session["user_id"],
        "currentDate": session["currentDate"],
        "expiryDate": session["expiryDate"]
    }}

@app.get("/session/delete/{user_id}")
async def delete_session(user_id: str):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    with get_connection() as conn:
        cur = conn.execute(
            "DELETE FROM sessions WHERE user_id = ?", (user_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        conn.commit()
    return {"status": "session deleted"}

@app.post("/auth/register", status_code=201)
async def register_user(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    email = data.get("email")
    password = data.get("password")
    
    if not user_id or not email or not password:
        raise HTTPException(status_code=400, detail="user_id, email, and password are required")
    
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO auth_data (user_id, email, password) VALUES (?, ?, ?)",
            (user_id, email, password)
        )
        conn.commit()

    if email:
        with get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM auth_data WHERE email = ? AND password = ?", 
                (email, password)
            )
            user = cur.fetchone()
    elif user_id:
        with get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM auth_data WHERE user_id = ? AND password = ?", 
                (user_id, password)
            )
            user = cur.fetchone()

    if (not user_id and not email) or not password:
        raise HTTPException(status_code=400, detail="email/user_id and password are required")
    
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * FROM auth_data WHERE user_id = ? AND password = ?", 
            (user_id, password)
        )
        user = cur.fetchone()
    
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create a session for the user
    current_date = datetime.utcnow().isoformat()
    expiry_date = (datetime.utcnow() + timedelta(days=30)).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO sessions (user_id, currentDate, expiryDate) VALUES (?, ?, ?)",
            (user_id, current_date, expiry_date)
        )
        conn.commit()
    # Return session information
    session_info = {
        "user_id": user_id,
        "currentDate": current_date,
        "expiryDate": expiry_date
    }
    
    return {"status": "logged in", "user_id": user["user_id"], "session": session_info} 



@app.post("/auth/login")
async def login_user(payload: LoginRequest, response: Response):
    user_id = payload.user_id
    email = payload.email
    password = payload.password

    if not password:
        raise HTTPException(status_code=400, detail="password is required")
    if not user_id or not email:
        raise HTTPException(status_code=400, detail="email or user_id is required")
    
    if email:
        with get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM auth_data WHERE email = ? AND password = ?", 
                (email, password)
            )
            user = cur.fetchone()
    elif user_id:
        with get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM auth_data WHERE user_id = ? AND password = ?", 
                (user_id, password)
            )
            user = cur.fetchone()

    if (not user_id and not email) or not password:
        raise HTTPException(status_code=400, detail="email/user_id and password are required")
    
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * FROM auth_data WHERE user_id = ? AND password = ?", 
            (user_id, password)
        )
        user = cur.fetchone()
    
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create a session for the user
    current_date = datetime.utcnow().isoformat()
    expiry_date = (datetime.utcnow() + timedelta(days=30)).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO sessions (user_id, currentDate, expiryDate) VALUES (?, ?, ?)",
            (user_id, current_date, expiry_date)
        )
        conn.commit()
    # Return session information
    session_info = {
        "user_id": user_id,
        "currentDate": current_date,
        "expiryDate": expiry_date
    }

    response.set_cookie(key="user_id", value=session_info["user_id"], path="/")
    response.set_cookie(key="currentDate", value=session_info["currentDate"], path="/")
    response.set_cookie(key="expiryDate", value=session_info["expiryDate"], path="/")
    
    return {"status": "logged in", "user_id": user["user_id"], "session": session_info} 

@app.get('/auth/user/{user_id}')
async def get_user(user_id: str):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM auth_data WHERE user_id = ?", (user_id,))
        user = cur.fetchone()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user["user_id"],
        "email": user["email"]
    }
@app.delete('/auth/user/{user_id}')
async def delete_user(user_id: str):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM auth_data WHERE user_id = ?", (user_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
    return {"status": "deleted"}
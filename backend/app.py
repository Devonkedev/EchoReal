import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request
from flask_cors import CORS

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
                email TEXT,
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

@app.route("/journal/entries", methods=["POST"])
def create_entry() -> Any:
    data: Dict[str, Any] = request.get_json(force=True)
    user_id = data.get("user_id")
    mood = data.get("mood")
    text = data.get("text")
    if not user_id or not mood or text is None:
        return jsonify({"error": "user_id, mood and text are required"}), 400
    mood_intensity = data.get("mood_intensity")
    spotify_track_id = data.get("spotify_track_id")
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
                user_id,
                ts_str,
                mood,
                mood_intensity,
                text,
                spotify_track_id,
                shared_to_json,
                liked_tracks_json,
            ),
        )
        entry_id = cur.lastrowid
        conn.commit()
    update_streak(user_id, now.date())
    return jsonify({"entry_id": entry_id, "status": "created"}), 201

@app.route("/journal/entries", methods=["GET"])
def list_entries() -> Any:
    user_id = request.args.get("user_id")
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
    return jsonify(entries)

@app.route("/journal/entries/<int:entry_id>", methods=["GET"])
def get_entry(entry_id: int) -> Any:
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
        row = cur.fetchone()
    if row is None:
        return jsonify({"error": "Entry not found"}), 404
    return jsonify(to_entry_dict(row))

@app.route("/journal/entries/<int:entry_id>", methods=["PATCH", "PUT"])
def update_entry(entry_id: int) -> Any:
    data: Dict[str, Any] = request.get_json(force=True)
    allowed = {"mood", "mood_intensity", "text"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return jsonify({"error": "No updatable fields provided"}), 400
    sets = ", ".join(f"{k} = ?" for k in updates.keys())
    params = list(updates.values()) + [entry_id]
    with get_connection() as conn:
        cur = conn.execute(f"UPDATE journal_entries SET {sets} WHERE id = ?", params)
        if cur.rowcount == 0:
            return jsonify({"error": "Entry not found"}), 404
        conn.commit()
    return jsonify({"status": "updated"})

@app.route("/journal/entries/<int:entry_id>", methods=["DELETE"])
def delete_entry(entry_id: int) -> Any:
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
        if cur.rowcount == 0:
            return jsonify({"error": "Entry not found"}), 404
        conn.commit()
    return jsonify({"status": "deleted"})

@app.route("/journal/entries/<int:entry_id>/attach-song", methods=["POST"])
def attach_song(entry_id: int) -> Any:
    data: Dict[str, Any] = request.get_json(force=True)
    track_id = data.get("track_id")
    if not track_id:
        return jsonify({"error": "track_id is required"}), 400
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE journal_entries SET spotify_track_id = ? WHERE id = ?",
            (track_id, entry_id),
        )
        if cur.rowcount == 0:
            return jsonify({"error": "Entry not found"}), 404
        conn.commit()
    return jsonify({"status": "attached"})

@app.route("/recommendations", methods=["GET"])
def recommendations() -> Any:
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
    return jsonify({"songs": songs})

@app.route("/share", methods=["POST"])
def share() -> Any:
    data: Dict[str, Any] = request.get_json(force=True)
    entry_id = data.get("entry_id")
    recipients: List[str] = data.get("recipients", [])
    if not entry_id or not recipients:
        return jsonify({"error": "entry_id and recipients are required"}), 400
    with get_connection() as conn:
        cur = conn.execute("SELECT shared_to FROM journal_entries WHERE id = ?", (entry_id,))
        row = cur.fetchone()
        if row is None:
            return jsonify({"error": "Entry not found"}), 404
        current_recipients = json.loads(row["shared_to"] or "[]")
        for r in recipients:
            if r not in current_recipients:
                current_recipients.append(r)
        conn.execute(
            "UPDATE journal_entries SET shared_to = ? WHERE id = ?",
            (json.dumps(current_recipients), entry_id),
        )
        conn.commit()
    return jsonify({"status": "shared"})

@app.route("/users/<user_id>/streak", methods=["GET"])
def get_streak(user_id: str) -> Any:
    with get_connection() as conn:
        cur = conn.execute("SELECT streak_count FROM users WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
    streak = row["streak_count"] if row else 0
    return jsonify({"streak_count": streak})

@app.route("/users", methods=["GET"])
def get_user() -> Any:
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

    return jsonify({"result": users})

@app.route("/users/<user_id>", methods=["POST"])
def create_user(user_id: str) -> Any:
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO users (user_id, streak_count, last_entry_date) VALUES (?, 0, NULL)",
            (user_id,)
        )
        conn.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "User already exists"}), 400
    return jsonify({"status": "created"}), 201

@app.route("/users/get/<user_id>", methods=["GET"])
def get_user_byid(user_id: str) -> Any:
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        )
        cur = cur.fetchone()

    if cur is None:
        return jsonify({"error": "User not found"}), 404
    user_data = {
        "user_id": cur["user_id"],
        "streak_count": cur["streak_count"],
        "last_entry_date": cur["last_entry_date"]
    }
    return jsonify({"res": user_data})


@app.route("/genius/generate", methods=["GET"])
def genius_generate() -> Any:
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    global text

    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM journal_entries WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
    if row is None:
        return jsonify({"error": "Entry not found"}), 404
   
    text = row["text"]
    if not text:
        return jsonify({"error": "No text found in entry"}), 400

    
    from matcher import match
    from api import ana

    result = match(text, ana)   
    return jsonify({"result": result})


@app.route("/session/create/<user_id>", methods=["GET"])
def create_session(user_id: str) -> Any:

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * from sessions where user_id = ?", (user_id,))
        existing_session = cur.fetchone()


    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO sessions (user_id, currentDate, expiryDate) VALUES (?,?,?)", (user_id, datetime.utcnow().isoformat(), (datetime.utcnow() + timedelta(days=30)).isoformat()))

        conn.commit()

    return jsonify({"status": "session created", "session": {
        "user_id": user_id,
        "currentDate": datetime.utcnow().isoformat(),
        "expiryDate": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }}), 201


@app.route("/session/validate/<user_id>", methods=["GET"])
def validate_session(user_id: str) -> Any:
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    with get_connection() as conn:
        cur = conn.execute(
            "SELECT * from sessions where user_id = ?", (user_id,))
        session = cur.fetchone()
    if not session:
        return jsonify({"error": "Session not found"}), 404
    
    current_date = datetime.utcnow()
    expiry_date = datetime.fromisoformat(session["expiryDate"])

    if current_date > expiry_date:
        return jsonify({"error": "Session expired"}), 403

    return jsonify({"status": "session valid", "session": {
        "user_id": session["user_id"],
        "currentDate": session["currentDate"],
        "expiryDate": session["expiryDate"]
    }}), 200

@app.route("/session/delete/<user_id>", methods=["GET"])
def delete_session(user_id: str) -> Any:
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    with get_connection() as conn:
        cur = conn.execute(
            "DELETE FROM sessions WHERE user_id = ?", (user_id,))
        if cur.rowcount == 0:
            return jsonify({"error": "Session not found"}), 404
        conn.commit()
    return jsonify({"status": "session deleted"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)

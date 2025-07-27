import requests, base64, re
from bs4 import BeautifulSoup
from api import ana
from dotenv import load_dotenv
import os
load_dotenv()

GENIUS_KEY = os.getenv("GENIUS_KEY")
SPOT_ID = os.getenv("SPOT_ID")
SPOT_SEC = os.getenv("SPOT_SEC")

def g_search(q):
    h = {"Authorization": f"Bearer {GENIUS_KEY}"}
    r = requests.get("https://api.genius.com/search", headers=h, params={"q": q})
    if r.status_code != 200: 
        return []
    hits = r.json().get("response", {}).get("hits", [])
    return [(x["result"]["title"], x["result"]["primary_artist"]["name"], x["result"]["url"]) for x in hits]


def get_lyrics(u):
    try:
        r = requests.get(u, timeout=10)
        if r.status_code != 200: return ""
        soup = BeautifulSoup(r.text, "html.parser")
        divs = soup.select("div[data-lyrics-container='true']")
        return "\n".join([d.get_text(separator="\n") for d in divs]).strip()
    except:
        return ""


def get_spot_token():
    a = f"{SPOT_ID}:{SPOT_SEC}"
    b64 = base64.b64encode(a.encode()).decode()
    h = {"Authorization": f"Basic {b64}", "Content-Type": "application/x-www-form-urlencoded"}  
    d = {"grant_type": "client_credentials"}
    r = requests.post("https://accounts.spotify.com/api/token", headers=h, data=d)
    return r.json().get("access_token") if r.status_code == 200 else None


def is_english_song(title, artist):
    import string
    
    text = f"{title} {artist}".lower()
    
    latin_chars = sum(1 for c in text if c in string.ascii_letters or c in string.digits or c in ' -.,()[]')
    total_chars = len([c for c in text if not c.isspace()])
    
    if total_chars == 0:
        return False
    
    latin_ratio = latin_chars / len(text)
    
    non_english_indicators = ['ñ', 'ü', 'ä', 'ö', 'é', 'è', 'à', 'ç', 'ß', 'ø', 'å', 'æ']
    has_non_english = any(char in text for char in non_english_indicators)
    
    return latin_ratio > 0.85 and not has_non_english


def get_popular_songs_by_emotion(emotion, sentiment, tok):
    h = {"Authorization": f"Bearer {tok}"}
    
    emotion_queries = {
        'joy': ['happy songs', 'feel good music', 'upbeat pop'],
        'sadness': ['sad songs', 'heartbreak songs', 'emotional ballads'], 
        'anger': ['angry songs', 'rock music', 'metal songs'],
        'love': ['love songs', 'romantic music', 'love ballads'],
        'fear': ['anxiety songs', 'sad music', 'emotional songs'],
        'surprise': ['upbeat music', 'pop songs', 'dance music']
    }
    
    sentiment_queries = {
        'positive': ['happy music', 'pop hits', 'feel good songs'],
        'very positive': ['celebration songs', 'party music', 'dance hits'],
        'negative': ['sad music', 'melancholy songs', 'breakup songs'],
        'very negative': ['depressing songs', 'dark music', 'sad ballads'],
        'neutral': ['chill music', 'indie songs', 'alternative music']
    }
    
    queries = []
    if emotion in emotion_queries:
        queries.extend(emotion_queries[emotion])
    if sentiment in sentiment_queries:
        queries.extend(sentiment_queries[sentiment])
    
    if not queries:
        queries = ['popular songs', 'top hits']
    
    all_tracks = []
    
    for query in queries[:2]:
        p = {"q": query, "type": "track", "limit": 20, "market": "US"}
        r = requests.get("https://api.spotify.com/v1/search", headers=h, params=p)
        if r.status_code == 200:
            items = r.json().get("tracks", {}).get("items", [])
            for item in items:
                title = item["name"]
                artist = item["artists"][0]["name"]
                
                if is_english_song(title, artist) and item["popularity"] >=40:
                    all_tracks.append({
                        "title": title,
                        "artist": artist,
                        "popularity": item["popularity"],
                        "link": item["external_urls"]["spotify"]
                    })
    
    all_tracks.sort(key=lambda x: x["popularity"], reverse=True)
    return all_tracks[:15]
    

def match(txt, ana_fn):
    res = ana_fn(txt)
    
    s_tok = get_spot_token() 
    if not s_tok:
        return "Spotify unavailable"
    
    popular_tracks = get_popular_songs_by_emotion(res["emotion"], res["sentiment"], s_tok)
    
    if not popular_tracks:
        return "No popular songs found for your mood."
    
    journal_words = set(word.lower() for word in res["tokens"] if len(word) > 3)
    keywords_lower = [kw.lower() for kw in res["keywords"][:3]]
    
    scored_tracks = []
    
    for track in popular_tracks:
        score = track["popularity"]
        
        title_lower = track["title"].lower()
        for keyword in keywords_lower:
            if keyword in title_lower:
                score += 50
        
        artist_lower = track["artist"].lower()
        for keyword in keywords_lower:
            if keyword in artist_lower:
                score += 30
        
        genius_hits = g_search(f"{track['title']} {track['artist']}")
        
        if genius_hits:
            lyrics = get_lyrics(genius_hits[0][2])
            if lyrics:
                lyrics_lower = lyrics.lower()
                if res["emotion"].lower() in lyrics_lower:
                    score += 25
                if res["sentiment"].lower() in lyrics_lower:
                    score += 15
                
                lyrics_words = set(re.findall(r'\b\w{4,}\b', lyrics_lower))
                overlap = len(journal_words & lyrics_words)
                score += overlap * 2
        
        scored_tracks.append((track, score))
    
    scored_tracks.sort(key=lambda x: x[1], reverse=True)
    top_tracks = scored_tracks[:15]
    
    if not top_tracks:
        return "No songs found for your mood."
    
    return top_tracks

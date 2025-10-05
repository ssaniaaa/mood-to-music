from flask import Flask, render_template, request, jsonify
import random
import requests
import base64
import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

app = Flask(__name__)

# -----------------------------
# 🔐 Spotify API Configuration
# -----------------------------
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

print(f"Loaded Client ID: {SPOTIFY_CLIENT_ID}")

# -----------------------------
# 🌎 Mood + Language Playlists (Curated by Spotify)
# -----------------------------
PLAYLISTS = {
    "en": {
        "happy": "37i9dQZF1DXdPec7aLTmlC",  # Happy Hits!
        "sad": "37i9dQZF1DX7qK8ma5wgG1",    # Sad Hour
        "calm": "37i9dQZF1DWU0ScTcjJBdj",   # Chill Hits
        "energetic": "37i9dQZF1DX0XUsuxWHRQd"  # Rock Classics
    },
    "hi": {
        "happy": "37i9dQZF1DX0XUfTFmNBRM",  # Happy Bollywood
        "sad": "37i9dQZF1DWYxUz0Ouugmb",    # Sad Bollywood (Arijit Singh, etc.)
        "calm": "37i9dQZF1DWXJfnUiYjUKT",   # Romantic Bollywood
        "energetic": "37i9dQZF1DX2RahGIyQXcJ"  # Dance Bollywood
    },
    "ar": {
        "happy": "37i9dQZF1DWYWddJiPzbvb",  # Happy Arabic
        "sad": "37i9dQZF1DWVFeEut75IAL",    # Sad Arabic
        "calm": "37i9dQZF1DX1gjlZ4QYhp4",   # Relaxing Arabic
        "energetic": "37i9dQZF1DX2RahGIyQXcJ"  # Party Arabic
    },
    "es": {
        "happy": "37i9dQZF1DX8mWv7JDZ0Ht",  # Happy Latin
        "sad": "37i9dQZF1DX2shzuwwKw0y",    # Sad Latin
        "calm": "37i9dQZF1DX6VdMW310YC9",   # Chill Latin
        "energetic": "37i9dQZF1DX0vHZ8elq0UK"  # Energetic Latin
    },
    "fr": {
        "happy": "37i9dQZF1DXb75pGxjraTQ",  # Happy French
        "sad": "37i9dQZF1DX8LIZNmf5qj3",    # Sad French
        "calm": "37i9dQZF1DX2K1QY91FEPi",   # Chill French
        "energetic": "37i9dQZF1DX3uU3ivlWmL2"  # Party French
    },
    "ur": {
        "happy": "37i9dQZF1DWZkHEX2YHpDV",  # Happy Urdu
        "sad": "37i9dQZF1DX0xL0s4TcSIP",    # Sad Urdu
        "calm": "37i9dQZF1DX0xL0s4TcSIP",   # Romantic Urdu
        "energetic": "37i9dQZF1DX2RahGIyQXcJ"  # Party Urdu
    },
    "zh": {
        "happy": "37i9dQZF1DX4pAtJte9weM",  # Happy Chinese
        "sad": "37i9dQZF1DX5FZ0gGkvnsU",    # Sad Chinese
        "calm": "37i9dQZF1DWYpB2Jdnw4FQ",   # Chill Chinese
        "energetic": "37i9dQZF1DWVzZlRWgqAGH"  # Energetic Chinese
    },
    "ja": {
        "happy": "37i9dQZF1DX5Lm1ZiObdc3",  # Happy Japanese
        "sad": "37i9dQZF1DX5IDTimEWoTd",    # Sad Japanese
        "calm": "37i9dQZF1DWZP6aGCJD2J6",   # Chill Japanese
        "energetic": "37i9dQZF1DX9XYT5qVuw7g"  # Energetic Japanese
    }
}

# -----------------------------
# 🎵 Sample Tracks for Each Mood (Fallback)
# -----------------------------
SAMPLE_TRACKS = {
    "hi": {
        "happy": [
            {"name": "Senorita", "artist": "Vishal & Shekhar"},
            {"name": "Ghungroo", "artist": "Arijit Singh"},
            {"name": "Makhna", "artist": "Tanishk Bagchi"}
        ],
        "sad": [
            {"name": "Tum Hi Ho", "artist": "Arijit Singh"},
            {"name": "Channa Mereya", "artist": "Arijit Singh"},
            {"name": "Phir Bhi Tumko Chaahunga", "artist": "Arijit Singh"},
            {"name": "Agar Tum Saath Ho", "artist": "Arijit Singh"},
            {"name": "Raabta", "artist": "Arijit Singh"}
        ],
        "calm": [
            {"name": "Tum Se Hi", "artist": "Mohit Chauhan"},
            {"name": "Jeene Laga Hoon", "artist": "Atif Aslam"},
            {"name": "Suna Hai", "artist": "Arijit Singh"}
        ],
        "energetic": [
            {"name": "Kar Gayi Chull", "artist": "Badshah"},
            {"name": "Badtameez Dil", "artist": "Benny Dayal"},
            {"name": "London Thumakda", "artist": "Labh Janjua"}
        ]
    },
    "en": {
        "happy": [
            {"name": "Happy", "artist": "Pharrell Williams"},
            {"name": "Can't Stop the Feeling", "artist": "Justin Timberlake"},
            {"name": "Good Vibrations", "artist": "The Beach Boys"}
        ],
        "sad": [
            {"name": "Someone Like You", "artist": "Adele"},
            {"name": "Say Something", "artist": "A Great Big World"},
            {"name": "All I Want", "artist": "Kodaline"}
        ],
        "calm": [
            {"name": "Weightless", "artist": "Marconi Union"},
            {"name": "Strawberry Swing", "artist": "Coldplay"},
            {"name": "Bloom", "artist": "The Paper Kites"}
        ],
        "energetic": [
            {"name": "Eye of the Tiger", "artist": "Survivor"},
            {"name": "Lose Yourself", "artist": "Eminem"},
            {"name": "Stronger", "artist": "Kanye West"}
        ]
    }
}
def get_playlist_url(mood, language):
    """Get Spotify embed URL for the mood and language"""
    language_playlists = PLAYLISTS.get(language, PLAYLISTS["en"])
    playlist_id = language_playlists.get(mood, PLAYLISTS["en"]["happy"])
    return f"https://open.spotify.com/embed/playlist/{playlist_id}"

def get_sample_tracks(mood, language):
    """Get sample tracks for display"""
    language_tracks = SAMPLE_TRACKS.get(language, SAMPLE_TRACKS["en"])
    return language_tracks.get(mood, language_tracks["happy"])

# -----------------------------
# 🚀 Flask Routes
# -----------------------------

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '').lower()
    language = data.get('language', 'en')

    # Detect mood
    mood = detect_mood(text)
    emoji = get_mood_emoji(mood)
    
    # Get playlist URL for embed
    playlist_url = get_playlist_url(mood, language)
    
    # Get sample tracks for display
    tracks = get_sample_tracks(mood, language)
    
    return jsonify({
        "mood": mood.capitalize(),
        "emoji": emoji,
        "tracks": tracks,
        "playlist_url": playlist_url,
        "playlist_id": PLAYLISTS.get(language, PLAYLISTS["en"]).get(mood, PLAYLISTS["en"]["happy"])
    })

# -----------------------------
# 🎵 Main Execution
# -----------------------------

if __name__ == "__main__":
    print("🚀 Starting Mood-to-Music App...")
    print("🎵 Using Spotify curated playlists for best experience!")
    app.run(host="0.0.0.0", port=8888, debug=True)
// --- AUTHENTICATION (Sign In / Sign Up) ---
// Create references to auth elements
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const authMessage = document.getElementById('authMessage');

if (signUpBtn && signInBtn && authMessage) {
  signUpBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
      authMessage.textContent = "❌ Please enter email and password.";
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[email]) {
      authMessage.textContent = "⚠️ Email already registered. Try signing in.";
      return;
    }

    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
    authMessage.textContent = "✅ Sign up successful! Opening app...";
    
    setTimeout(() => {
      window.open('app.html', '_blank'); // Open app in new tab
    }, 1000);
  });

  signInBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      authMessage.textContent = "❌ Please enter email and password.";
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (!users[email]) {
      authMessage.textContent = "⚠️ Email not registered. Please sign up.";
      return;
    }

    if (users[email] !== password) {
      authMessage.textContent = "❌ Incorrect password. Try again.";
      return;
    }

    authMessage.textContent = "✅ Sign in successful! Opening app...";
    
    setTimeout(() => {
      window.open('app.html', '_blank'); // Open app in new tab
    }, 1000);
  });
}

// --- MOOD DETECTION LOGIC (with full emoji + word support) ---
function showResult(mood, emoji, playlistUrl) {
  const r = document.getElementById('result');
  const embed = document.getElementById('spotifyEmbed');
  const frame = document.getElementById('playlistFrame');
  r.style.display = 'flex';
  embed.style.display = 'block';

  let cls = 'mood-neutral';
  if (mood.toLowerCase() === 'happy') cls = 'mood-happy';
  else if (mood.toLowerCase() === 'calm') cls = 'mood-calm';
  else if (mood.toLowerCase() === 'sad' || mood.toLowerCase() === 'heartbroken') cls = 'mood-sad';
  else if (mood.toLowerCase() === 'angry') cls = 'mood-angry';

  r.innerHTML = `
    <div class="mood-badge ${cls}">
      <div class="mood-emoji">${emoji}</div>
      <div>${mood}</div>
    </div>
    <div class="mood-info">
      <h3>Your Playlist</h3>
      <p>We picked a playlist to match your mood ↓</p>
    </div>
  `;

  frame.src = playlistUrl.replace("open.spotify.com/playlist/", "open.spotify.com/embed/playlist/");
}

// --- EMOJI MAP ---
const emojiMap = {
  '😄': { mood: 'Happy', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' },
  '😊': { mood: 'Happy', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' },
  '😁': { mood: 'Happy', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' },
  '🙂': { mood: 'Happy', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' },
  '😌': { mood: 'Calm', url: 'https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj' },
  '🌿': { mood: 'Calm', url: 'https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj' },
  '🧘': { mood: 'Calm', url: 'https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj' },
  '😢': { mood: 'Sad', url: 'https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1' },
  '😭': { mood: 'Sad', url: 'https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1' },
  '💔': { mood: 'Heartbroken', url: 'https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1' },
  '❤️': { mood: 'Romantic', url: 'https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn' },
  '😍': { mood: 'Romantic', url: 'https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn' },
  '🎉': { mood: 'Party', url: 'https://open.spotify.com/playlist/37i9dQZF1DXaXB8fQg7xif' },
  '🎵': { mood: 'Instrumental', url: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS' },
  '💪': { mood: 'Gym', url: 'https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh' },
  '😠': { mood: 'Angry', url: 'https://open.spotify.com/playlist/37i9dQZF1DWY6vTWIdZ54A' }
};

// Normalize emoji (remove variation selectors)
function normalizeEmoji(e) {
  return e.replace(/[\uFE0E\uFE0F]/g, '');
}

// Extract all emojis (supports complex ones)
function extractEmojis(text) {
  const regex = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;
  return text.match(regex) || [];
}

// --- WORD KEYWORDS MAP ---
const wordMap = {
  Happy: ["happy", "excited", "great", "joy", "amazing", "good"],
  Sad: ["sad", "down", "lonely", "unhappy", "depressed"],
  Heartbroken: ["heartbroken", "broken", "hurting", "love lost"],
  Romantic: ["romantic", "love", "loving", "crush", "affection"],
  Party: ["party", "dance", "fun", "celebrate", "night"],
  Calm: ["calm", "relaxed", "peaceful", "chill", "cozy"],
  Instrumental: ["instrumental", "study", "focus", "work", "concentrate"],
  Gym: ["gym", "workout", "training", "exercise", "fit"],
  Angry: ["angry", "mad", "frustrated", "annoyed", "upset"]
};

// Analyze text for emojis and words
async function analyzeText(text) {
  const lower = text.toLowerCase();
  const emojis = extractEmojis(text).map(normalizeEmoji);
  let mood = "Neutral", emoji = "🙂", playlistUrl = "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6";

  // Step 1: Direct emoji match
  for (const e of emojis) {
    if (emojiMap[e]) {
      mood = emojiMap[e].mood;
      emoji = e;
      playlistUrl = emojiMap[e].url;
      showResult(mood, emoji, playlistUrl);
      return;
    }
  }

  // Step 2: Word-based detection
  for (const [m, keywords] of Object.entries(wordMap)) {
    for (const word of keywords) {
      if (lower.includes(word)) {
        // Pick the first emoji in emojiMap that matches this mood
        const em = Object.keys(emojiMap).find(k => emojiMap[k].mood.toLowerCase() === m.toLowerCase());
        mood = m;
        emoji = em || "🙂";
        playlistUrl = emojiMap[emoji].url;
        showResult(mood, emoji, playlistUrl);
        return;
      }
    }
  }

  // Step 3: Default Neutral
  showResult(mood, emoji, playlistUrl);
}

// --- BUTTON EVENTS ---
document.getElementById('analyzeBtn').addEventListener('click', () => {
  const txt = document.getElementById('text').value.trim();
  if (!txt) return alert('Please type something or use the mic 🎤');
  analyzeText(txt);
});

// --- VOICE INPUT ---
const micBtn = document.getElementById('micBtn');
micBtn.addEventListener('click', () => startVoiceInput());

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert('Voice input not supported.');

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.disabled = true;
  micBtn.textContent = '🎙️...';
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('text').value = transcript;
    analyzeText(transcript);
  };

  recognition.onend = () => {
    micBtn.disabled = false;
    micBtn.textContent = '🎤';
  };
}

// --- DARK MODE ---
const toggleBtn = document.getElementById('toggleDarkMode');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// --- SPOTIFY BUTTON ---
document.getElementById('spotifyBtn').addEventListener('click', () => {
  window.open('https://open.spotify.com/', '_blank');
});

// --- START A JAM FEATURE ---
const jamBtn = document.getElementById('jamBtn');
const jamInfo = document.getElementById('jamInfo');

jamBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    jamInfo.textContent = "❌ Geolocation not supported by your browser.";
    return;
  }

  jamInfo.textContent = "📍 Getting your location...";

  navigator.geolocation.getCurrentPosition(success, error);

  function success(position) {
    const lat = position.coords.latitude.toFixed(3);
    const lon = position.coords.longitude.toFixed(3);

    jamInfo.innerHTML = `
      ✅ Location found!<br>
      You're starting a <strong>Jam</strong> near <em>${lat}, ${lon}</em>.<br>
      Connecting you with others who feel the same vibe...
    `;
  }

  function error() {
    jamInfo.textContent = "⚠️ Location access denied. Please allow location to start a jam.";
  }
});

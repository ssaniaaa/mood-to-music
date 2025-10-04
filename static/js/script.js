// 🌙 Toggle between Light and Dark Mode
document.getElementById('toggleDarkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('toggleDarkMode');
  btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// 🎵 Button to open Spotify directly
document.getElementById('spotifyBtn').addEventListener('click', () => {
  window.open('https://open.spotify.com/', '_blank');
});

// 🧠 Handle Analyze Button Click
document.getElementById('analyzeBtn').addEventListener('click', () => {
  const txt = document.getElementById('text').value.trim();
  const lang = document.getElementById('languageSelect').value;

  if (!txt) {
    alert('Please type something or use the mic 🎤');
    return;
  }

  analyzeText(txt, lang);
});

// 🎙️ Optional: Voice Input (using browser speech recognition)
const micBtn = document.getElementById('micBtn');
micBtn.addEventListener('click', () => startVoiceInput());

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Voice input not supported in this browser 😔');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.disabled = true;
  micBtn.textContent = '🎙️... listening';

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('text').value = transcript;
    const lang = document.getElementById('languageSelect').value;
    analyzeText(transcript, lang);
  };

  recognition.onend = () => {
    micBtn.disabled = false;
    micBtn.textContent = '🎤';
  };

  recognition.onerror = (err) => {
    console.error(err);
    micBtn.disabled = false;
    micBtn.textContent = '🎤';
  };
}

// 🧠 Function: Send text + language to Flask backend
async function analyzeText(text, language) {
  try {
    const resp = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });

    const data = await resp.json();
    showResult(data.mood, data.emoji, data.playlist);
  } catch (err) {
    console.error('Error analyzing mood:', err);
    alert('Something went wrong. Please try again.');
  }
}

// 🎨 Function: Display results dynamically
function showResult(mood, emoji, playlistUrl) {
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'flex';

  let moodClass = 'mood-neutral';
  if (mood.toLowerCase() === 'happy') moodClass = 'mood-happy';
  else if (mood.toLowerCase() === 'calm') moodClass = 'mood-calm';
  else if (mood.toLowerCase() === 'sad') moodClass = 'mood-sad';

  resultDiv.innerHTML = `
    <div class="mood-badge ${moodClass}">
      <div class="mood-emoji">${emoji}</div>
      <div class="mood-label">${mood}</div>
    </div>
    <div class="mood-info">
      <h3>Playlist suggestion</h3>
      <p>Enjoy music that matches your ${mood.toLowerCase()} vibe.</p>
      <a href="${playlistUrl}" target="_blank" rel="noopener" class="playlist-link">🎶 Open on Spotify</a>
    </div>
  `;
}

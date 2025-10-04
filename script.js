// --- MOOD DETECTION LOGIC ---
function showResult(mood, emoji, playlistUrl) {
    const r = document.getElementById('result');
    const embed = document.getElementById('spotifyEmbed');
    const frame = document.getElementById('playlistFrame');
    r.style.display = 'flex';
    embed.style.display = 'block';
  
    let cls = 'mood-neutral';
    if (mood.toLowerCase() === 'happy') cls = 'mood-happy';
    else if (mood.toLowerCase() === 'calm') cls = 'mood-calm';
    else if (mood.toLowerCase() === 'sad') cls = 'mood-sad';
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
  
    // Spotify embed link
    frame.src = playlistUrl.replace("open.spotify.com/playlist/", "open.spotify.com/embed/playlist/");
  }
  
  function fallbackMapping(mood) { 
  mood = mood.toLowerCase();

  // Happy / Energetic
  if (mood.includes('happy') || mood.includes('excited') || mood.includes('energetic'))
    return {emoji:'😄', url:'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC'};

  // Calm / Peaceful / Chill
  if (mood.includes('calm') || mood.includes('relax') || mood.includes('peaceful') || mood.includes('chill'))
    return {emoji:'😌', url:'https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj'};

  // Sad / Lonely / Heartbroken
  if (mood.includes('sad') || mood.includes('lonely') || mood.includes('heartbroken') || mood.includes('depressed'))
    return {emoji:'💔', url:'https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1'};

  // Romantic / Love
  if (mood.includes('romantic') || mood.includes('love') || mood.includes('affection') || mood.includes('date'))
    return {emoji:'❤️', url:'https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn'};

  // Party / Fun / Dance
  if (mood.includes('party') || mood.includes('dance') || mood.includes('fun') || mood.includes('celebrate'))
    return {emoji:'🎉', url:'https://open.spotify.com/playlist/37i9dQZF1DXaXB8fQg7xif'};

  // Instrumental / Focus / Study
  if (mood.includes('instrumental') || mood.includes('focus') || mood.includes('study') || mood.includes('work'))
    return {emoji:'🎵', url:'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS'};

  // Gym / Workout / Pumped
  if (mood.includes('gym') || mood.includes('workout') || mood.includes('training') || mood.includes('motivation'))
    return {emoji:'💪', url:'https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh'};

  // Angry / Frustrated
  if (mood.includes('angry') || mood.includes('mad') || mood.includes('frustrated'))
    return {emoji:'😠', url:'https://open.spotify.com/playlist/37i9dQZF1DWY6vTWIdZ54A'};

  // Default (Neutral)
  return {emoji:'🙂', url:'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6'};
}


async function analyzeText(text) {
  const lower = text.toLowerCase();
  let mood = "Neutral";

  if (lower.includes("happy") || lower.includes("excited") || lower.includes("great"))
    mood = "Happy";
  else if (lower.includes("sad") || lower.includes("lonely") || lower.includes("down"))
    mood = "Sad";
  else if (lower.includes("heartbroken") || lower.includes("broken"))
    mood = "Heartbroken";
  else if (lower.includes("romantic") || lower.includes("love") || lower.includes("affection"))
    mood = "Romantic";
  else if (lower.includes("party") || lower.includes("dance") || lower.includes("fun"))
    mood = "Party";
  else if (lower.includes("calm") || lower.includes("peaceful") || lower.includes("relaxed"))
    mood = "Calm";
  else if (lower.includes("instrumental") || lower.includes("focus") || lower.includes("study"))
    mood = "Instrumental";
  else if (lower.includes("gym") || lower.includes("workout") || lower.includes("training"))
    mood = "Gym";
  else if (lower.includes("angry") || lower.includes("mad") || lower.includes("frustrated"))
    mood = "Angry";

  const { emoji, url } = fallbackMapping(mood);
  showResult(mood, emoji, url);
}

  
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
  

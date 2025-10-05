import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// 🔑 Your Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authMessage = document.getElementById('authMessage');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');

// SIGN UP
signUpBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if(!email || !password) return authMessage.textContent = "Fill both fields!";

  createUserWithEmailAndPassword(auth,email,password)
    .then(() => { authMessage.style.color = "#a0ff90"; authMessage.textContent = "✅ Account created! Redirecting..."; setTimeout(()=>window.location.href="index.html",1000); })
    .catch(err => { authMessage.style.color="#ff8080"; authMessage.textContent = `❌ ${err.message}`; });
});

// SIGN IN
signInBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if(!email || !password) return authMessage.textContent = "Fill both fields!";

  signInWithEmailAndPassword(auth,email,password)
    .then(() => { authMessage.style.color = "#a0ff90"; authMessage.textContent = "✅ Signed in! Redirecting..."; setTimeout(()=>window.location.href="index.html",1000); })
    .catch(err => { authMessage.style.color="#ff8080"; authMessage.textContent = `❌ ${err.message}`; });
});

// Redirect if already signed in
onAuthStateChanged(auth,user => {
  if(user) window.location.href = "index.html";
});

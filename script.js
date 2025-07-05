import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD03vMpBpU5TOYwLy-hpImkku-MvwzANLw",
  authDomain: "srecsocial-98c6f.firebaseapp.com",
  projectId: "srecsocial-98c6f",
  storageBucket: "srecsocial-98c6f.appspot.com",
  messagingSenderId: "92453012487",
  appId: "1:92453012487:web:1ee9723799a929c64356a2",
  measurementId: "G-NYDLMEV2TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auto redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./home.html";
  }
});

// Handle Login
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("message");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    msg.textContent = `✅ Logged in as ${userCredential.user.email}`;
    msg.className = "success";
    setTimeout(() => window.location.href = "home.html", 1000);
  } catch (err) {
    msg.textContent = err.message.includes("auth/invalid-credential")
      ? "❌ Invalid credentials. Please check your email/password."
      : "❌ " + err.message;
    msg.className = "error";
  }
};

// Handle Signup
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("message");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    msg.textContent = `✅ Account created: ${userCredential.user.email}`;
    msg.className = "success";
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "error";
  }
};

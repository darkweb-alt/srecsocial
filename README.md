Folder Structure:

📁 your-project/
├── index.html
├── home.html
├── script.js          <-- used only in index.html
├── home.js            <-- used only in home.html

---
```
index.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Firebase Login</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: grid;
      place-items: center;
      height: 100vh;
      background: #f3f3f3;
    }

    .login-box {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      width: 300px;
    }

    input, button {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      font-size: 1rem;
    }

    button {
      background: #007bff;
      color: white;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    button:hover {
      background: #0056b3;
    }

    #message {
      margin-top: 10px;
      font-size: 0.9rem;
      text-align: center;
    }

    .error {
      color: red;
    }

    .success {
      color: green;
    }
  </style>
</head>
<body>
  <div class="login-box">
    <h2>Firebase Login</h2>
    <input type="email" id="email" placeholder="Email" />
    <input type="password" id="password" placeholder="Password" />
    <button onclick="login()">Login</button>
    <button onclick="signup()">Sign Up</button>
    <div id="message"></div>
  </div>

  <script type="module" src="script.js"></script>
</body>
</html>

---

script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD03vMpBpU5TOYwLy-hpImkku-MvwzANLw",
  authDomain: "srecsocial-98c6f.firebaseapp.com",
  projectId: "srecsocial-98c6f",
  storageBucket: "srecsocial-98c6f.appspot.com",
  messagingSenderId: "92453012487",
  appId: "1:92453012487:web:1ee9723799a929c64356a2",
  measurementId: "G-NYDLMEV2TE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./home.html";
  }
});

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

---

home.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome Home</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: grid;
      place-items: center;
      height: 100vh;
      background-color: #e3f2fd;
      flex-direction: column;
      gap: 20px;
    }

    h1 {
      color: #007bff;
    }

    button {
      padding: 10px 20px;
      background: #007bff;
      border: none;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
    }

    button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <h1 id="welcome">🎉 Welcome!</h1>
  <button id="logoutBtn">Logout</button>

  <script type="module" src="home.js"></script>
</body>
</html>

---

home.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD03vMpBpU5TOYwLy-hpImkku-MvwzANLw",
  authDomain: "srecsocial-98c6f.firebaseapp.com",
  projectId: "srecsocial-98c6f",
  storageBucket: "srecsocial-98c6f.appspot.com",
  messagingSenderId: "92453012487",
  appId: "1:92453012487:web:1ee9723799a929c64356a2",
  measurementId: "G-NYDLMEV2TE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("welcome").textContent = `🎉 Welcome, ${user.email}!`;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Logout failed: " + error.message);
  }
});
```
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD03vMpBpU5TOYwLy-hpImkku-MvwzANLw",
  authDomain: "srecsocial-98c6f.firebaseapp.com",
  projectId: "srecsocial-98c6f",
  storageBucket: "srecsocial-98c6f.appspot.com",
  messagingSenderId: "92453012487",
  appId: "1:92453012487:web:1ee9723799a929c64356a2",
  measurementId: "G-NYDLMEV2TE",
};

const GEMINI_API_KEY = "AIzaSyAhnZ9oCOlvsw-Dn8AaoFPFWO6H1POWN4U"; // <-- Replace with your actual Gemini API key

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const welcomeEl = document.getElementById("welcome");
const logoutBtn = document.getElementById("logoutBtn");
const postBtn = document.getElementById("postBtn");
const postContent = document.getElementById("postContent");
const postsContainer = document.getElementById("postsContainer");

let currentUserEmail = null;

// Redirect if not logged in, else set welcome
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUserEmail = user.email;
    welcomeEl.textContent = `🎉 Welcome, ${user.email}!`;
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
});

const postsCol = collection(db, "posts");

postBtn.addEventListener("click", async () => {
  const content = postContent.value.trim();
  if (!content) {
    alert("Please write something to post!");
    return;
  }
  if (!currentUserEmail) {
    alert("User not logged in!");
    return;
  }

  try {
    await addDoc(postsCol, {
      username: currentUserEmail,
      content,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      comments: [],
      shares: 0,
    });
    postContent.value = "";
  } catch (error) {
    alert("Error posting: " + error.message);
  }
});

// Toggle like/unlike for post
async function toggleLike(postId, likedBy) {
  const postRef = doc(db, "posts", postId);
  const userHasLiked = likedBy.includes(currentUserEmail);

  try {
    if (userHasLiked) {
      await updateDoc(postRef, {
        likedBy: likedBy.filter((email) => email !== currentUserEmail),
        likes: likedBy.length - 1,
      });
    } else {
      await updateDoc(postRef, {
        likedBy: [...likedBy, currentUserEmail],
        likes: likedBy.length + 1,
      });
    }
  } catch (err) {
    alert("Error updating like: " + err.message);
  }
}

// Call Gemini API to analyze content
async function callGeminiFlashAPI(prompt) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Network response was not ok");
  }

  return await response.json();
}

// Typewriter effect for showing text
function typewriterEffect(element, text, speed = 20) {
  element.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

const postsQuery = query(postsCol, orderBy("createdAt", "desc"));
onSnapshot(postsQuery, (snapshot) => {
  postsContainer.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const post = docSnap.data();
    const postId = docSnap.id;
    const createdAt = post.createdAt
      ? post.createdAt.toDate().toLocaleString()
      : "Just now";

    const userHasLiked = post.likedBy?.includes(currentUserEmail);

    const postDiv = document.createElement("div");
    postDiv.style.marginBottom = "15px";
    postDiv.style.padding = "10px";
    postDiv.style.background = "#fff";
    postDiv.style.borderRadius = "8px";
    postDiv.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";

    postDiv.innerHTML = `
      <strong>${post.username}</strong>
      <small style="margin-left: 10px; color: #777;">${createdAt}</small>
      <p>${post.content}</p>
      <small>
        <span id="likes_${postId}" style="cursor:pointer; color: ${
      userHasLiked ? "#007bff" : "#555"
    };" title="Click to ${userHasLiked ? "unlike" : "like"}">
          Likes: ${post.likes}
        </span>
        | Comments: ${post.comments.length} | Shares: ${post.shares}
      </small>
    `;

    // Analyze button & container
    const analyzeBtn = document.createElement("button");
    analyzeBtn.textContent = "Analyze";
    analyzeBtn.style.marginTop = "10px";
    analyzeBtn.style.cursor = "pointer";

    const analysisDiv = document.createElement("div");
    analysisDiv.style.marginTop = "10px";
    analysisDiv.style.minHeight = "40px";
    analysisDiv.style.color = "#333";

    postDiv.appendChild(analyzeBtn);
    postDiv.appendChild(analysisDiv);

    postsContainer.appendChild(postDiv);

    // Like toggle event
    const likesSpan = document.getElementById(`likes_${postId}`);
    likesSpan.addEventListener("click", () =>
      toggleLike(postId, post.likedBy || [])
    );

    // Analyze button click event
    analyzeBtn.addEventListener("click", async () => {
      analysisDiv.textContent = "⏳ Analyzing...";
      try {
        const analysisResult = await callGeminiFlashAPI(
          post.content + " .Now analyse this and tell me its sentiments in one sentence"
        );
        const content =
          analysisResult?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No valid analysis.";
        typewriterEffect(analysisDiv, content);
      } catch (error) {
        analysisDiv.textContent = "❌ Error: " + error.message;
      }
    });
  });
});

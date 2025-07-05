import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD03vMpBpU5TOYwLy-hpImkku-MvwzANLw",
  authDomain: "srecsocial-98c6f.firebaseapp.com",
  projectId: "srecsocial-98c6f",
  storageBucket: "srecsocial-98c6f.appspot.com",
  messagingSenderId: "92453012487",
  appId: "1:92453012487:web:1ee9723799a929c64356a2"
};

const GEMINI_API_KEY = "AIzaSyAhnZ9oCOlvsw-Dn8AaoFPFWO6H1POWN4U";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const welcomeEl = document.getElementById("welcome");
const postBtn = document.getElementById("postBtn");
const logoutBtn = document.getElementById("logoutBtn");
const postContent = document.getElementById("postContent");
const postImage = document.getElementById("postImage");
const postsContainer = document.getElementById("postsContainer");

let currentUserEmail = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUserEmail = user.email;
    welcomeEl.textContent = `🎉 Welcome, ${user.email}`;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

const postsRef = collection(db, "posts");

postBtn.addEventListener("click", async () => {
  const content = postContent.value.trim();
  const file = postImage.files[0];

  if (!content && !file) return alert("Write something or select an image!");

  let imageUrl = null;

  if (file) {
    const formData = new FormData();
    formData.append("image", file);
    const imgbbApi = "3c33c3e4179c4b47ad9b5878b6570727";
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApi}`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    imageUrl = data.data.url;
  }

  await addDoc(postsRef, {
    username: currentUserEmail,
    content,
    imageUrl,
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: []
  });

  postContent.value = "";
  postImage.value = null;
});

function typewriterEffect(element, text, speed = 30) {
  element.textContent = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

async function analyzePost(content, outputEl) {
  outputEl.textContent = "⏳ Analyzing...";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: content + "\nNow analyze this and tell me its sentiments in one sentence." }],
            },
          ],
        }),
      }
    );

    const result = await response.json();
    const analysis = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis result.";

    typewriterEffect(outputEl, "✅ Analysis: " + analysis);
  } catch (err) {
    outputEl.textContent = "❌ Error analyzing: " + err.message;
  }
}

const postQuery = query(postsRef, orderBy("createdAt", "desc"));

onSnapshot(postQuery, (snapshot) => {
  postsContainer.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const post = docSnap.data();
    const id = docSnap.id;
    const userLiked = post.likedBy?.includes(currentUserEmail);
    const safeContent = post.content.replace(/`/g, "\\`").replace(/\$/g, "\\$"); // escape for template literals
    const analysisOutputId = `analysis-${id}`;

    const div = document.createElement("div");
    div.style.marginBottom = "15px";
    div.style.padding = "10px";
    div.style.background = "#fff";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";

    div.innerHTML = `
      <strong>${post.username}</strong> 
      <small style="float:right;">${post.createdAt?.toDate().toLocaleString() || "Now"}</small>
      <p>${post.content}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" style="max-width:100%; height:auto; border-radius: 5px;" />` : ""}
      <small style="cursor:pointer; color: ${userLiked ? 'blue' : 'gray'};" id="like-${id}">👍 Likes: ${post.likes}</small><br>
      <button onclick="analyzePost(\`${safeContent}\`, document.getElementById('${analysisOutputId}'))">Analyze</button>
      ${
        post.username === currentUserEmail
          ? `<button onclick="updatePost('${id}', \`${safeContent}\`)">Update</button>
             <button onclick="deletePost('${id}')">Delete</button>`
          : ""
      }
      <div id="${analysisOutputId}" style="margin-top:8px; color:#333; font-style: italic;"></div>
    `;

    postsContainer.appendChild(div);
    document.getElementById(`like-${id}`).onclick = () => toggleLike(id, post.likedBy || []);
  });
});

async function toggleLike(postId, likedBy) {
  const ref = doc(db, "posts", postId);
  const hasLiked = likedBy.includes(currentUserEmail);
  const updatedLikes = hasLiked
    ? likedBy.filter(user => user !== currentUserEmail)
    : [...likedBy, currentUserEmail];
  await updateDoc(ref, {
    likedBy: updatedLikes,
    likes: updatedLikes.length
  });
}

window.updatePost = async function (postId, currentContent) {
  const newContent = prompt("Update your post:", currentContent);
  if (newContent === null) return;
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, { content: newContent });
};

window.deletePost = async function (postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    const ref = doc(db, "posts", postId);
    await deleteDoc(ref);
  }
};

// Make functions available globally for inline onclick handlers
window.analyzePost = analyzePost;

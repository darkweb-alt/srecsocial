import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD03vMpBpU5TOYwLy-hpImkku-MvwzANLw",
  authDomain: "srecsocial-98c6f.firebaseapp.com",
  projectId: "srecsocial-98c6f",
  storageBucket: "srecsocial-98c6f.appspot.com",
  messagingSenderId: "92453012487",
  appId: "1:92453012487:web:1ee9723799a929c64356a2"
};

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

const postQuery = query(postsRef, orderBy("createdAt", "desc"));

onSnapshot(postQuery, (snapshot) => {
  postsContainer.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const post = docSnap.data();
    const id = docSnap.id;
    const userLiked = post.likedBy?.includes(currentUserEmail);
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${post.username}</strong> 
      <small style="float:right;">${post.createdAt?.toDate().toLocaleString() || "Now"}</small>
      <p>${post.content}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" />` : ""}
      <small style="cursor:pointer; color: ${userLiked ? 'blue' : 'gray'};" id="like-${id}">👍 Likes: ${post.likes}</small>
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

//  const GEMINI_API_KEY = "AIzaSyB4UhEXohg-GnUP1qeE6ZLJN0PLeyY8Meg";


// // import { GEMINI_API_KEY } from "./config.js";

// // Example: Making Gemini API call
// async function callGeminiAPI(prompt) {
//   const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       contents: [
//         { parts: [{ text: prompt }] }
//       ]
//     })
//   });

//   const data = await response.json();
//   console.log("Gemini Response:", data);
// }

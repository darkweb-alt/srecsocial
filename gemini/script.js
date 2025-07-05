const GEMINI_API_KEY = "AIzaSyAhnZ9oCOlvsw-Dn8AaoFPFWO6H1POWN4U";



async function callGeminiFlashAPI(prompt) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Network response was not ok");
  }

  return await response.json();
}

function typewriterMarkdown(element, markdown, speed = 20) {
  // Convert markdown to HTML
  const html = marked.parse(markdown);
  element.innerHTML = "";

  let i = 0;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const finalHTML = tempDiv.innerHTML;

  function type() {
    if (i <= finalHTML.length) {
      element.innerHTML = finalHTML.slice(0, i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

window.sendPrompt = async function () {
  const prompt = document.getElementById("prompt").value.trim();
  const output = document.getElementById("output");

  if (!prompt) {
    output.innerHTML = "⚠️ Please enter a prompt.";
    return;
  }

  output.innerHTML = "⏳ Waiting for Gemini response...";

  try {
    const result = await callGeminiFlashAPI(prompt);
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (content) {
      typewriterMarkdown(output, content);
    } else {
      output.innerHTML = "❌ No valid response received.";
    }
  } catch (err) {
    output.innerHTML = "❌ Error: " + err.message;
  }
};


# Firebase Social App

This is a simple social media web application built using Firebase Authentication and Firestore. Users can register, log in, post text and images, like posts, update their posts, delete posts, and analyze post content sentiment using Google Gemini API.

## Features

- User authentication with Firebase Auth
- Posting text and images (images uploaded via imgbb API)
- Like/unlike posts with real-time updates
- Update and delete own posts with custom modal dialogs
- Analyze post sentiment using Google Gemini API
- Responsive UI with a clean design

## Technologies Used

- Firebase (Authentication, Firestore)
- Google Gemini API for AI analysis
- imgbb API for image uploads
- Vanilla JavaScript (ES Modules)
- HTML5 & CSS3

## Setup Instructions

1. Clone this repository or copy the project files to your local machine.
2. Replace Firebase configuration with your own Firebase project credentials in `home.js`.
3. Get an API key from [imgbb](https://imgbb.com/) for image uploads and replace the API key in `home.js`.
4. Get an API key for Google Gemini API and update the relevant code in your project.
5. Run a local server or host the files on a static server.
6. Open `index.html` to start.

## Usage

- Register or log in using your Firebase Auth credentials.
- Create posts with text or images.
- Like posts and see live updates.
- Update or delete your own posts using the buttons provided.
- Analyze post sentiment with the Analyze button on each post.

## Custom Features

- Custom responsive modal popup dialogs for updating and deleting posts instead of default browser prompts/alerts.
- Image upload support integrated with imgbb.
- Real-time Firestore updates using onSnapshot listeners.

## Author

Pitambar Yadav

A passionate computer science student and aspiring software developer currently studying at Sri Ramakrishna Engineering College, Coimbatore. Dedicated to building practical web apps and exploring AI-powered features.

---

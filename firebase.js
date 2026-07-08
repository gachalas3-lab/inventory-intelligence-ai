import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAlQyc15lj5w6ZB3qj6D-BctvBKZy9mXP4",
    authDomain: "inventory-intelligence-ai.firebaseapp.com",
    projectId: "inventory-intelligence-ai",
    storageBucket: "inventory-intelligence-ai.firebasestorage.app",
    messagingSenderId: "724244920286",
    appId: "1:724244920286:web:ed879163faa3bd2b5dcf4f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
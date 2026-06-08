/**
 * Firebase Configuration
 * Grow A Garden - Smart Garden Management
 */

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBm2ykWyuo1HUn3yP2bL4npTNEhjaewnxk",
    authDomain: "growagarden-34ddd.firebaseapp.com",
    projectId: "growagarden-34ddd",
    storageBucket: "growagarden-34ddd.firebasestorage.app",
    messagingSenderId: "803133422881",
    appId: "1:803133422881:web:4e67e498f97eb2c9261260",
    measurementId: "G-W1SDGD26X6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence for Firestore
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.log('The current browser does not support offline persistence.');
    }
});

// Export for use in other files
window.firebase = firebase;
window.auth = auth;
window.db = db;

console.log('Firebase initialized successfully');

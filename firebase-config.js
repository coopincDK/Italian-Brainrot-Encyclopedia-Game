// ============================================
// ITALIAN BRAINROT - FIREBASE CONFIGURATION
// Global Highscore System
// ============================================

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyGg8ItSNNNVYZw04oaIowpPZGYU05s7yRI",
    authDomain: "italian-brainrot-encyclopedia.firebaseapp.com",
    databaseURL: "https://italian-brainrot-encyclopedia-default-rtdb.europe-west1.firebasedatabase.app",  // TODO: Verificer denne URL i Firebase Console
    projectId: "italian-brainrot-encyclopedia",
    storageBucket: "italian-brainrot-encyclopedia.firebasestorage.app",
    messagingSenderId: "830881286787",
    appId: "1:830881286787:web:8844a0ab986edd72b0a9b6",
    measurementId: "G-T4FTKJNTBX"
};

// Initialize Firebase (will be done after Firebase SDK loads)
let firebaseApp = null;
let database = null;
let firebaseInitialized = false;

function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined' && !firebaseInitialized) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            firebaseInitialized = true;
            console.log('✅ Firebase initialized successfully');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error.message);
        return false;
    }
    return false;
}

// Check if Firebase is available
function isFirebaseAvailable() {
    return firebaseInitialized && database !== null;
}

// Export for use in other files
window.FirebaseConfig = {
    init: initializeFirebase,
    isAvailable: isFirebaseAvailable,
    getDatabase: () => database
};

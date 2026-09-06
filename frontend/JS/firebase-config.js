// Firebase client-side configuration.
//
// projectId/authDomain/storageBucket below are already filled in for your
// project (ai-agent-dee1a). apiKey, messagingSenderId and appId are unique
// to the specific Web App registered inside that project, so they can't be
// guessed - copy them from:
//   Firebase Console -> Project Settings (gear icon) -> General tab
//   -> "Your apps" -> Web app -> SDK setup and configuration -> Config
//
// See FIREBASE_SETUP.md at the project root for the full walkthrough.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDN7yL9vISJUoLLOh0gXFck-y9wwWphP6U",
  authDomain: "ai-agent-5a70d.firebaseapp.com",
  projectId: "ai-agent-5a70d",
  storageBucket: "ai-agent-5a70d.firebasestorage.app",
  messagingSenderId: "76004420497",
  appId: "1:76004420497:web:072893ba3caadc3dc34830",
  measurementId: "G-R5YN3S37H8"
};

firebase.initializeApp(firebaseConfig);

// Optional: keep users signed in across browser restarts (this is the
// default, but explicit is nice). Use SESSION instead of LOCAL if you'd
// rather sign out when the tab/browser closes.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const googleProvider = new firebase.auth.GoogleAuthProvider();

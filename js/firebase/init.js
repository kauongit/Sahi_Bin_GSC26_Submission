/**
 * Sahi Bin - Firebase Initialization
 * Uses Firebase v10 modular SDK loaded from CDN.
 * Initializes App, Auth, Firestore (with offline persistence), and Storage.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { firebaseConfig } from './config.js';

/** @type {import('firebase/app').FirebaseApp} */
let app = null;

/** @type {import('firebase/auth').Auth} */
let auth = null;

/** @type {import('firebase/firestore').Firestore} */
let db = null;

/** @type {import('firebase/storage').FirebaseStorage} */
let storage = null;

/** Whether Firebase has been initialized */
let initialized = false;

/**
 * Initialize all Firebase services.
 * Safe to call multiple times — only initializes once.
 */
export async function initFirebase() {
  if (initialized) return;

  try {
    // 1. Initialize Firebase App
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialized');

    // 2. Initialize Auth with local persistence
    auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    console.log('[Firebase] Auth initialized with local persistence');

    // 3. Initialize Firestore with IndexedDB persistence for offline support
    db = getFirestore(app);
    try {
      await enableIndexedDbPersistence(db);
      console.log('[Firebase] Firestore offline persistence enabled');
    } catch (err) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open — persistence can only be enabled in one tab at a time
        console.warn('[Firebase] Firestore persistence failed: multiple tabs open. Offline mode limited to one tab.');
      } else if (err.code === 'unimplemented') {
        // Browser doesn't support IndexedDB persistence
        console.warn('[Firebase] Firestore persistence not supported in this browser.');
      } else {
        console.error('[Firebase] Firestore persistence error:', err);
      }
    }

    // 4. Initialize Cloud Storage
    storage = getStorage(app);
    console.log('[Firebase] Storage initialized');

    initialized = true;
    console.log('[Firebase] All services ready');
  } catch (err) {
    console.error('[Firebase] Initialization failed:', err);
    throw err;
  }
}

/**
 * Check if Firebase has been initialized.
 * @returns {boolean}
 */
export function isInitialized() {
  return initialized;
}

export { app, auth, db, storage };

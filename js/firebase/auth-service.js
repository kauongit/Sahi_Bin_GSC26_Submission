/**
 * Sahi Bin - Firebase Auth Service
 * Complete authentication service using Firebase v10 modular SDK.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { auth, db } from './init.js';

/**
 * Log in with email and password.
 * Returns the enriched user profile from Firestore.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User profile with role, name, etc.
 */
export async function loginWithEmail(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await fetchUserProfile(credential.user.uid);
    if (!profile) {
      throw new Error('User profile not found in database');
    }
    return profile;
  } catch (err) {
    throw mapAuthError(err);
  }
}

/**
 * Register a new citizen account.
 * Creates Firebase Auth account + Firestore user document.
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.name
 * @param {string} userData.phone
 * @param {string} [userData.address]
 * @param {string} [userData.areaId]
 * @param {string} [userData.householdId]
 * @returns {Promise<Object>} Created user profile
 */
export async function registerCitizen(userData) {
  try {
    // 1. Create auth account
    const credential = await createUserWithEmailAndPassword(
      auth,
      userData.email.trim(),
      userData.password
    );
    const uid = credential.user.uid;

    // 2. Update display name in Firebase Auth
    await updateProfile(credential.user, { displayName: userData.name });

    // 3. Create Firestore user document
    const userDoc = {
      uid,
      email: userData.email.trim().toLowerCase(),
      name: userData.name.trim(),
      phone: userData.phone.trim(),
      role: 'citizen',
      address: userData.address || '',
      areaId: userData.areaId || '',
      householdId: userData.householdId || '',
      profilePhoto: '',
      totalPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalCollections: 0,
      segregationScore: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', uid), userDoc);

    // Return the profile (with uid and role)
    return { ...userDoc, createdAt: new Date(), updatedAt: new Date() };
  } catch (err) {
    throw mapAuthError(err);
  }
}

/**
 * Register a worker account (typically done by admin, but API is here).
 * @param {Object} workerData
 * @returns {Promise<Object>} Created worker profile
 */
export async function registerWorker(workerData) {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      workerData.email.trim(),
      workerData.password
    );
    const uid = credential.user.uid;

    await updateProfile(credential.user, { displayName: workerData.name });

    const userDoc = {
      uid,
      email: workerData.email.trim().toLowerCase(),
      name: workerData.name.trim(),
      phone: workerData.phone.trim(),
      role: 'worker',
      areaId: workerData.areaId || '',
      assignedRoute: workerData.assignedRoute || '',
      vehicleId: workerData.vehicleId || '',
      profilePhoto: '',
      status: 'active',
      totalCollectionsToday: 0,
      totalWeightToday: 0,
      joinedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', uid), userDoc);
    return { ...userDoc, createdAt: new Date(), updatedAt: new Date() };
  } catch (err) {
    throw mapAuthError(err);
  }
}

/**
 * Log out the current user.
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('[Auth] Logout error:', err);
    throw err;
  }
}

/**
 * Send a password reset email.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err) {
    throw mapAuthError(err);
  }
}

/**
 * Listen for authentication state changes.
 * Enriches the user with their Firestore profile (role, name, etc).
 * @param {Function} callback - Called with enriched user object or null
 * @returns {Function} Unsubscribe function
 */
export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) {
          callback(profile);
        } else {
          // Auth user exists but no Firestore profile — sign out
          console.warn('[Auth] No profile found for authenticated user, signing out');
          await signOut(auth);
          callback(null);
        }
      } catch (err) {
        console.error('[Auth] Error fetching profile:', err);
        // Still pass basic user info so the app doesn't break
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: 'citizen', // Default fallback
          _profileError: true
        });
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get the current Firebase Auth user (raw, without Firestore enrichment).
 * @returns {import('firebase/auth').User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Get the current user's UID.
 * @returns {string|null}
 */
export function getCurrentUserId() {
  return auth.currentUser ? auth.currentUser.uid : null;
}


// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Fetch a user's full profile from Firestore.
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
async function fetchUserProfile(uid) {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  } catch (err) {
    console.error('[Auth] Failed to fetch user profile:', err);
    throw err;
  }
}

/**
 * Map Firebase auth error codes to user-friendly Hindi-English messages.
 * @param {Error} err
 * @returns {Error}
 */
function mapAuthError(err) {
  const codeMessages = {
    'auth/user-not-found': 'यह email registered नहीं है',
    'auth/wrong-password': 'गलत password। पुनः प्रयास करें',
    'auth/invalid-credential': 'गलत email या password',
    'auth/email-already-in-use': 'यह email पहले से registered है',
    'auth/weak-password': 'Password कम से कम 6 characters का होना चाहिए',
    'auth/invalid-email': 'कृपया सही email दर्ज करें',
    'auth/too-many-requests': 'बहुत ज़्यादा प्रयास। कुछ देर बाद कोशिश करें',
    'auth/network-request-failed': 'Network error। Internet connection जांचें',
    'auth/user-disabled': 'यह account disable कर दिया गया है',
    'auth/operation-not-allowed': 'यह operation allowed नहीं है'
  };

  const message = codeMessages[err.code] || err.message || 'Authentication error';
  const mappedError = new Error(message);
  mappedError.code = err.code;
  mappedError.originalError = err;
  return mappedError;
}

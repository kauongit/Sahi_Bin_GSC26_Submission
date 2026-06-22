/**
 * Sahi Bin - Firebase Storage & Media Service
 * Handles uploading images to Firebase Storage and managing media metadata in Firestore.
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { collection, addDoc, doc, deleteDoc, query, where, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db, storage } from './init.js';
import { compressImage } from '../utils.js';

// ============================================================================
// STORAGE UPLOAD & DELETE SERVICES
// ============================================================================

/**
 * Uploads a blob to Firebase Storage.
 * @param {Blob} blob - The image blob to upload.
 * @param {string} path - Target path in storage, e.g. 'waste_images/xyz123.jpg'.
 * @returns {Promise<string>} Download URL of the uploaded image.
 */
export async function uploadImage(blob, path) {
  try {
    // Compress image before upload (max 1024px width, 0.8 quality)
    const compressedBlob = await compressImage(blob, 1024, 0.8);
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, compressedBlob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.error('[Storage] Image upload failed:', err);
    throw new Error('Image upload failed: ' + err.message);
  }
}

/**
 * Deletes a file from Firebase Storage.
 * @param {string} path - File path in storage.
 * @returns {Promise<void>}
 */
export async function deleteImage(path) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (err) {
    console.error('[Storage] Image deletion failed:', err);
    throw new Error('Image deletion failed: ' + err.message);
  }
}

// ============================================================================
// MEDIA METADATA SERVICE
// ============================================================================

/**
 * Centralized media creation.
 * Uploads to storage and creates a media record in Firestore.
 * @param {string} type - 'waste_image' | 'complaint_image' | 'profile_image' | 'household_image'
 * @param {string} uploadedBy - UID of user uploading
 * @param {string} relatedCollection - Firestore collection name, e.g., 'waste_logs'
 * @param {string} relatedId - Document ID inside that collection
 * @param {Blob} blob - Image file blob
 * @returns {Promise<{mediaId: string, url: string}>}
 */
export async function createMedia(type, uploadedBy, relatedCollection, relatedId, blob) {
  try {
    const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
    const storagePath = `media/${type}/${filename}`;
    
    // 1. Upload to storage
    const url = await uploadImage(blob, storagePath);
    
    // 2. Create media record in Firestore
    const mediaDoc = {
      type,
      uploadedBy,
      relatedCollection,
      relatedId,
      url,
      storagePath,
      createdAt: serverTimestamp(),
      metadata: {
        size: blob.size,
        mimeType: blob.type
      }
    };
    
    const docRef = await addDoc(collection(db, 'media'), mediaDoc);
    return { mediaId: docRef.id, url };
  } catch (err) {
    console.error('[Media] Failed to create media record:', err);
    throw err;
  }
}

/**
 * Fetch media records associated with a specific Firestore document.
 * @param {string} relatedCollection 
 * @param {string} relatedId 
 * @returns {Promise<Array<Object>>}
 */
export async function getMediaForDocument(relatedCollection, relatedId) {
  try {
    const q = query(
      collection(db, 'media'),
      where('relatedCollection', '==', relatedCollection),
      where('relatedId', '==', relatedId)
    );
    const querySnapshot = await getDocs(q);
    const media = [];
    querySnapshot.forEach(doc => {
      media.push({ mediaId: doc.id, ...doc.data() });
    });
    return media;
  } catch (err) {
    console.error('[Media] Failed to fetch media records:', err);
    throw err;
  }
}

/**
 * Deletes media from storage and Firestore.
 * @param {string} mediaId - Firestore media document ID.
 * @param {string} storagePath - Storage path to delete.
 */
export async function deleteMedia(mediaId, storagePath) {
  try {
    // Delete from Storage
    if (storagePath) {
      await deleteImage(storagePath);
    }
    // Delete from Firestore
    await deleteDoc(doc(db, 'media', mediaId));
  } catch (err) {
    console.error('[Media] Failed to delete media:', err);
    throw err;
  }
}

/**
 * Sahi Bin - Offline IndexedDB Queue
 * Wraps IndexedDB to store pending waste logs, images, and media logs while offline.
 */

const DB_NAME = 'sahi_bin_offline';
const DB_VERSION = 1;

/**
 * Open the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (e) => {
      console.error('[IndexedDB] Database failed to open:', e);
      reject(e.target.error);
    };

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Object store for pending waste collection logs
      if (!db.objectStoreNames.contains('pending_logs')) {
        db.createObjectStore('pending_logs', { keyPath: 'id', autoIncrement: true });
      }
      
      // Object store for raw images (binary blobs) awaiting upload
      if (!db.objectStoreNames.contains('pending_images')) {
        db.createObjectStore('pending_images', { keyPath: 'id', autoIncrement: true });
      }
      
      // Object store for media uploads records
      if (!db.objectStoreNames.contains('pending_media')) {
        db.createObjectStore('pending_media', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Add an item to the specified IndexedDB store.
 * @param {string} storeName - 'pending_logs' | 'pending_images' | 'pending_media'
 * @param {Object} data 
 * @returns {Promise<number>} Inserted key
 */
export async function enqueue(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Gets and removes the oldest item from the specified store (FIFO).
 * @param {string} storeName 
 * @returns {Promise<Object|null>}
 */
export async function dequeue(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.openCursor(); // Gets the first/oldest item

    getRequest.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const val = cursor.value;
        const key = cursor.key;
        const deleteRequest = store.delete(key);
        
        deleteRequest.onsuccess = () => {
          resolve({ id: key, ...val });
        };
        
        deleteRequest.onerror = (err) => {
          reject(err.target.error);
        };
      } else {
        resolve(null);
      }
    };

    getRequest.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Gets all records in a store.
 * @param {string} storeName 
 * @returns {Promise<Array<Object>>}
 */
export async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Counts the number of items in a store.
 * @param {string} storeName 
 * @returns {Promise<number>}
 */
export async function count(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Remove an item by its key.
 * @param {string} storeName 
 * @param {number} id 
 * @returns {Promise<void>}
 */
export async function remove(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Clears all records from a store.
 * @param {string} storeName 
 * @returns {Promise<void>}
 */
export async function clear(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

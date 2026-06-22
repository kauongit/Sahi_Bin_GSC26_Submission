/**
 * Sahi Bin - Reactive State Store
 * Centralized state management with pub/sub and localStorage persistence.
 */

/** Keys that are persisted to localStorage */
const PERSISTED_KEYS = ['currentUser', 'currentSession'];

/** localStorage key prefix */
const LS_PREFIX = 'sahi_';

class Store {
  constructor() {
    /** @type {Object} Application state */
    this.state = {
      currentUser: null,        // { uid, role, name, phone, email, areaId, ... }
      currentSession: null,     // Active collection session data
      networkStatus: 'online',  // 'online' | 'offline'
      offlineQueueCount: 0,     // Number of items waiting to sync
      gpsStatus: 'unknown',     // 'available' | 'denied' | 'unavailable' | 'unknown'
      notifications: [],        // Unread notification objects
      currentRoute: null,       // Current hash route string
      syncInProgress: false,    // Whether sync is running
      lastSyncTime: null,       // Timestamp of last successful sync
      toasts: [],               // Active toast notifications
      modalContent: null        // Current modal content HTML or null
    };

    /** @type {Object<string, Set<Function>>} Subscription listeners keyed by state key */
    this.listeners = {};

    /** @type {Set<Function>} Global listeners called on any state change */
    this.globalListeners = new Set();
  }

  /**
   * Get a state value by key.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set a state value and notify subscribers.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;

    // Persist critical state to localStorage
    if (PERSISTED_KEYS.includes(key)) {
      try {
        if (value === null || value === undefined) {
          localStorage.removeItem(`${LS_PREFIX}${key}`);
        } else {
          localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value));
        }
      } catch (err) {
        console.warn(`[Store] Failed to persist ${key}:`, err);
      }
    }

    // Notify key-specific listeners
    this._notify(key, value, oldValue);

    // Notify global listeners
    this.globalListeners.forEach(cb => {
      try {
        cb(key, value, oldValue);
      } catch (err) {
        console.error('[Store] Global listener error:', err);
      }
    });
  }

  /**
   * Batch-update multiple state values, notifying once per key.
   * @param {Object} updates - Key-value pairs to set
   */
  batchSet(updates) {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value);
    }
  }

  /**
   * Subscribe to changes on a specific state key.
   * @param {string} key
   * @param {Function} callback - (newValue, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = new Set();
    }
    this.listeners[key].add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[key].delete(callback);
      if (this.listeners[key].size === 0) {
        delete this.listeners[key];
      }
    };
  }

  /**
   * Subscribe to all state changes.
   * @param {Function} callback - (key, newValue, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  subscribeAll(callback) {
    this.globalListeners.add(callback);
    return () => this.globalListeners.delete(callback);
  }

  /**
   * Get a snapshot of the entire state (shallow copy).
   * @returns {Object}
   */
  getSnapshot() {
    return { ...this.state };
  }

  /**
   * Restore persisted state from localStorage.
   * Called once during app initialization.
   */
  restore() {
    for (const key of PERSISTED_KEYS) {
      try {
        const raw = localStorage.getItem(`${LS_PREFIX}${key}`);
        if (raw !== null) {
          this.state[key] = JSON.parse(raw);
        }
      } catch (err) {
        console.warn(`[Store] Failed to restore ${key}:`, err);
        localStorage.removeItem(`${LS_PREFIX}${key}`);
      }
    }
  }

  /**
   * Clear all state and localStorage. Called on logout.
   */
  clear() {
    // Clear persisted data
    for (const key of PERSISTED_KEYS) {
      localStorage.removeItem(`${LS_PREFIX}${key}`);
    }

    // Reset state to defaults
    this.state = {
      currentUser: null,
      currentSession: null,
      networkStatus: this.state.networkStatus, // Keep network status
      offlineQueueCount: 0,
      gpsStatus: this.state.gpsStatus,         // Keep GPS status
      notifications: [],
      currentRoute: this.state.currentRoute,   // Keep current route
      syncInProgress: false,
      lastSyncTime: null,
      toasts: [],
      modalContent: null
    };

    // Notify all listeners of the reset
    for (const key of Object.keys(this.listeners)) {
      this._notify(key, this.state[key], undefined);
    }
  }

  /**
   * Notify all subscribers for a given key.
   * @param {string} key
   * @param {*} newValue
   * @param {*} oldValue
   * @private
   */
  _notify(key, newValue, oldValue) {
    const keyListeners = this.listeners[key];
    if (!keyListeners || keyListeners.size === 0) return;

    keyListeners.forEach(callback => {
      try {
        callback(newValue, oldValue);
      } catch (err) {
        console.error(`[Store] Listener error for key "${key}":`, err);
      }
    });
  }
}

/** Singleton store instance */
export const store = new Store();

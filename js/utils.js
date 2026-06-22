/**
 * Sahi Bin - Utility Functions
 * Date formatting, validation, image compression, DOM helpers, and more.
 */

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const HINDI_DAYS = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

/**
 * Convert a Firestore timestamp or Date to a JS Date.
 * @param {*} timestamp - Firestore Timestamp, Date, or epoch millis
 * @returns {Date}
 */
function toDate(timestamp) {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (typeof timestamp === 'number') return new Date(timestamp);
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date();
}

/**
 * Format a timestamp as "22 Jun 2026".
 * @param {*} timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
  const d = toDate(timestamp);
  const day = d.getDate();
  const month = SHORT_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format a timestamp as "10:30 AM".
 * @param {*} timestamp
 * @returns {string}
 */
export function formatTime(timestamp) {
  const d = toDate(timestamp);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format a timestamp as a relative time string in Hindi-English mix.
 * Examples: "अभी", "5 min पहले", "2 घंटे पहले", "कल", "22 Jun"
 * @param {*} timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  const d = toDate(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'अभी';
  if (diffMin < 60) return `${diffMin} min पहले`;
  if (diffHour < 24) return `${diffHour} घंटे पहले`;
  if (diffDay === 1) return 'कल';
  if (diffDay < 7) return `${diffDay} दिन पहले`;
  return formatDate(d);
}

/**
 * Format weight with "KG" suffix.
 * @param {number} kg
 * @returns {string}
 */
export function formatWeight(kg) {
  if (kg === null || kg === undefined) return '0 KG';
  const rounded = Math.round(kg * 10) / 10;
  return `${rounded} KG`;
}

/**
 * Format points with sign prefix.
 * @param {number} points
 * @returns {string}
 */
export function formatPoints(points) {
  if (!points && points !== 0) return '0';
  return points >= 0 ? `+${points}` : `${points}`;
}

/**
 * Format percentage value.
 * @param {number} value - Value between 0 and 100
 * @returns {string}
 */
export function formatPercentage(value) {
  if (value === null || value === undefined) return '0%';
  return `${Math.round(value)}%`;
}

/**
 * Get Hindi day name from day-of-week index (0=Sunday).
 * @param {number} dayOfWeek
 * @returns {string}
 */
export function getDayName(dayOfWeek) {
  return HINDI_DAYS[dayOfWeek] || '';
}

/**
 * Get Hindi month name from month index (0=January).
 * @param {number} monthIndex
 * @returns {string}
 */
export function getHindiMonth(monthIndex) {
  return HINDI_MONTHS[monthIndex] || '';
}


// ============================================================================
// TEXT & STRING UTILITIES
// ============================================================================

/**
 * Truncate text with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + '…';
}

/**
 * Generate a random alphanumeric ID.
 * @param {number} length
 * @returns {string}
 */
export function generateId(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Sanitize HTML string to prevent XSS. Escapes all HTML entities.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Conditionally combine CSS class names.
 * Accepts strings, objects { className: boolean }, and arrays (flattened).
 * @param  {...(string|Object|Array)} args
 * @returns {string}
 */
export function classNames(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classes.push(classNames(...arg));
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.filter(Boolean).join(' ');
}


// ============================================================================
// GREETING
// ============================================================================

/**
 * Get time-appropriate Hindi greeting.
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'नमस्ते';
  if (hour < 12) return 'सुप्रभात';
  if (hour < 17) return 'नमस्ते';
  if (hour < 21) return 'शुभ संध्या';
  return 'शुभ रात्रि';
}


// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email format.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validate Indian phone number (10 digits, starts with 6-9).
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  // Accept with or without +91 or 91 prefix
  const re = /^(?:\+?91)?[6-9]\d{9}$/;
  return re.test(cleaned);
}

/**
 * Validate that a field is not empty.
 * @param {*} value
 * @param {string} fieldName - Human-readable field name for the error message
 * @returns {string|null} Error message string, or null if valid
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined) return `${fieldName} आवश्यक है`;
  if (typeof value === 'string' && value.trim() === '') return `${fieldName} आवश्यक है`;
  return null;
}


// ============================================================================
// FUNCTION UTILITIES
// ============================================================================

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - Milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId = null;
  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

/**
 * Throttle a function call.
 * @param {Function} fn
 * @param {number} delay - Milliseconds
 * @returns {Function}
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0;
  let timeoutId = null;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);
    clearTimeout(timeoutId);
    if (remaining <= 0) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Promisified setTimeout.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ============================================================================
// IMAGE UTILITIES
// ============================================================================

/**
 * Compress an image blob using canvas.
 * @param {Blob} blob - Original image blob
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - JPEG quality (0 to 1)
 * @returns {Promise<Blob>} Compressed image blob
 */
export function compressImage(blob, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

/**
 * Convert a Blob to a base64 data URL string.
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a base64 data URL string back to a Blob.
 * @param {string} base64 - Data URL string like "data:image/jpeg;base64,..."
 * @returns {Blob}
 */
export function base64ToBlob(base64) {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const raw = atob(parts[1]);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}


// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/** Toast container element reference */
let toastContainer = null;

/**
 * Get or create the toast container element.
 * @returns {HTMLElement}
 */
function getToastContainer() {
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer;

  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    pointer-events: none;
    width: calc(100% - 32px);
    max-width: 420px;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

/** Toast type styles */
const TOAST_STYLES = {
  info: { bg: '#D6E0FF', border: '#3366FF', icon: 'ℹ️' },
  success: { bg: '#C8E6C9', border: '#1B6B3C', icon: '✅' },
  error: { bg: '#FFCDD2', border: '#D32F2F', icon: '❌' },
  warning: { bg: '#FFF9C4', border: '#F9A825', icon: '⚠️' }
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {number} duration - Auto-dismiss in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  const style = TOAST_STYLES[type] || TOAST_STYLES.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: ${style.bg};
    border: 3px solid ${style.border};
    border-radius: 12px;
    box-shadow: 4px 4px 0px #1A1A1A;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1A1A1A;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 200ms ease, transform 200ms ease;
    max-width: 100%;
    word-break: break-word;
  `;
  toast.innerHTML = `<span>${style.icon}</span><span>${sanitizeHTML(message)}</span>`;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Auto-dismiss
  const dismissTimeout = setTimeout(() => removeToast(toast), duration);

  // Click to dismiss
  toast.addEventListener('click', () => {
    clearTimeout(dismissTimeout);
    removeToast(toast);
  });
}

/**
 * Animate and remove a toast element.
 * @param {HTMLElement} toast
 */
function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-20px)';
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 200);
}


// ============================================================================
// MODAL
// ============================================================================

/** Modal overlay element reference */
let modalOverlay = null;

/**
 * Show a modal with the given HTML content.
 * @param {string} content - HTML string for modal body
 */
export function showModal(content) {
  hideModal(); // Close any existing modal

  modalOverlay = document.createElement('div');
  modalOverlay.id = 'modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    opacity: 0;
    transition: opacity 200ms ease;
  `;

  const modalBox = document.createElement('div');
  modalBox.id = 'modal-box';
  modalBox.style.cssText = `
    background: #FFFFFF;
    border: 3px solid #1A1A1A;
    border-radius: 12px;
    box-shadow: 4px 4px 0px #1A1A1A;
    max-width: 420px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    padding: 24px;
    transform: scale(0.9);
    transition: transform 200ms ease;
  `;
  modalBox.innerHTML = content;

  // Close on overlay click (not on box click)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) hideModal();
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      hideModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  // Animate in
  requestAnimationFrame(() => {
    modalOverlay.style.opacity = '1';
    modalBox.style.transform = 'scale(1)';
  });
}

/**
 * Hide/close the currently open modal.
 */
export function hideModal() {
  if (modalOverlay && document.body.contains(modalOverlay)) {
    modalOverlay.style.opacity = '0';
    const box = modalOverlay.querySelector('#modal-box');
    if (box) box.style.transform = 'scale(0.9)';
    setTimeout(() => {
      if (modalOverlay && modalOverlay.parentNode) {
        modalOverlay.parentNode.removeChild(modalOverlay);
      }
      modalOverlay = null;
    }, 200);
  }
}

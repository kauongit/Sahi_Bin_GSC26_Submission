/**
 * network-banner.js — Network Status Banner
 * Shows/hides connectivity status banners (offline, syncing, synced).
 * Uses direct DOM manipulation on #network-banner.
 * 
 * @module components/network-banner
 */

/**
 * Banner state configurations
 */
const BANNER_STATES = {
  offline: {
    className: 'network-banner--offline',
    icon: '📡',
    message: 'Offline Mode — Data save hoga, baad mein sync hoga',
    bgColor: '#FFF9C4',
    borderColor: '#F9A825',
    textColor: '#1A1A1A',
    autoDismiss: false
  },
  syncing: {
    className: 'network-banner--syncing',
    icon: '⟳',
    message: 'items sync ho rahe hain...',
    bgColor: '#D6E0FF',
    borderColor: '#3366FF',
    textColor: '#1A1A1A',
    autoDismiss: false
  },
  synced: {
    className: 'network-banner--synced',
    icon: '✓',
    message: 'Sab sync ho gaya',
    bgColor: '#C8E6C9',
    borderColor: '#1B6B3C',
    textColor: '#1A1A1A',
    autoDismiss: true,
    dismissDelay: 3000
  },
  online: {
    className: 'network-banner--online',
    icon: '✓',
    message: 'Wapas online aa gaye!',
    bgColor: '#C8E6C9',
    borderColor: '#1B6B3C',
    textColor: '#1A1A1A',
    autoDismiss: true,
    dismissDelay: 3000
  }
};

/** Reference to the auto-dismiss timer */
let dismissTimer = null;

/**
 * Gets or creates the network banner DOM element.
 * @returns {HTMLElement}
 */
function getBannerElement() {
  let banner = document.getElementById('network-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'network-banner';
    banner.className = 'network-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    // Insert at the top of body
    document.body.insertBefore(banner, document.body.firstChild);
  }
  return banner;
}

/**
 * Updates the banner to show a specific state.
 * @param {'offline'|'syncing'|'synced'|'online'} state — Banner state
 * @param {Object} options
 * @param {number} options.syncCount — Number of items syncing (for syncing state)
 */
export function showNetworkBanner(state, options = {}) {
  const { syncCount = 0 } = options;
  const config = BANNER_STATES[state];
  if (!config) return;

  // Clear previous timer
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  const banner = getBannerElement();

  // Build message
  let message = config.message;
  if (state === 'syncing' && syncCount > 0) {
    message = `${syncCount} ${config.message}`;
  }

  // Update banner content and styles
  banner.className = `network-banner ${config.className} network-banner--visible`;
  banner.style.cssText = `
    background-color: ${config.bgColor};
    border-bottom: 3px solid ${config.borderColor};
    color: ${config.textColor};
  `;
  banner.innerHTML = `
    <span class="network-banner__icon ${state === 'syncing' ? 'network-banner__icon--spinning' : ''}">${config.icon}</span>
    <span class="network-banner__message">${message}</span>
  `;

  // Auto-dismiss if configured
  if (config.autoDismiss) {
    dismissTimer = setTimeout(() => {
      hideNetworkBanner();
    }, config.dismissDelay || 3000);
  }
}

/**
 * Hides the network banner.
 */
export function hideNetworkBanner() {
  const banner = document.getElementById('network-banner');
  if (banner) {
    banner.classList.remove('network-banner--visible');
    banner.classList.add('network-banner--hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      banner.className = 'network-banner';
      banner.innerHTML = '';
    }, 300);
  }

  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

/**
 * Initializes the network banner with online/offline event listeners.
 * Call once at app startup.
 */
export function initNetworkBanner() {
  // Create banner element
  getBannerElement();

  // Show offline banner if already offline
  if (!navigator.onLine) {
    showNetworkBanner('offline');
  }

  // Listen for connectivity changes
  window.addEventListener('online', () => {
    showNetworkBanner('online');
  });

  window.addEventListener('offline', () => {
    showNetworkBanner('offline');
  });
}

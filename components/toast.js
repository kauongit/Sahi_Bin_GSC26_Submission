/**
 * toast.js — Toast Notification Component
 * Creates and manages toast notifications at the bottom of the screen.
 * Uses direct DOM manipulation (appends to #toast-container).
 * 
 * @module components/toast
 */

/** Counter for unique toast IDs */
let toastCounter = 0;

/**
 * Type-specific toast configurations
 */
const TOAST_CONFIG = {
  success: {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="20 6 9 17 4 12"/>
           </svg>`,
    bgColor: '#C8E6C9',
    borderColor: '#1B6B3C',
    textColor: '#1A1A1A'
  },
  error: {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/>
             <line x1="15" y1="9" x2="9" y2="15"/>
             <line x1="9" y1="9" x2="15" y2="15"/>
           </svg>`,
    bgColor: '#FFCDD2',
    borderColor: '#D32F2F',
    textColor: '#1A1A1A'
  },
  warning: {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9A825" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
             <line x1="12" y1="9" x2="12" y2="13"/>
             <line x1="12" y1="17" x2="12.01" y2="17"/>
           </svg>`,
    bgColor: '#FFF9C4',
    borderColor: '#F9A825',
    textColor: '#1A1A1A'
  },
  info: {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3366FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/>
             <line x1="12" y1="16" x2="12" y2="12"/>
             <line x1="12" y1="8" x2="12.01" y2="8"/>
           </svg>`,
    bgColor: '#D6E0FF',
    borderColor: '#3366FF',
    textColor: '#1A1A1A'
  }
};

/**
 * Shows a toast notification.
 * @param {string} message — Toast message text
 * @param {Object} options
 * @param {'success'|'error'|'warning'|'info'} options.type     — Toast type
 * @param {number}  options.duration — Auto-dismiss ms (default: 3000, 0 = persistent)
 * @param {string}  options.actionText — Optional action button text
 * @param {Function} options.onAction  — Action button callback
 */
export function showToast(message, options = {}) {
  const {
    type = 'info',
    duration = 3000,
    actionText = '',
    onAction = null
  } = options;

  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const toastId = `toast-${++toastCounter}`;

  // Ensure toast container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Build toast element
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    background-color: ${config.bgColor};
    border: 3px solid ${config.borderColor};
    color: ${config.textColor};
  `;

  const actionHtml = actionText
    ? `<button class="toast__action" id="${toastId}-action">${actionText}</button>`
    : '';

  toast.innerHTML = `
    <div class="toast__icon">${config.icon}</div>
    <span class="toast__message">${message}</span>
    ${actionHtml}
    <button class="toast__close" aria-label="Close notification" id="${toastId}-close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${config.textColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  // Dismiss helper
  const dismiss = () => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  };

  // Close button
  const closeBtn = document.getElementById(`${toastId}-close`);
  if (closeBtn) closeBtn.addEventListener('click', dismiss);

  // Action button
  if (actionText && onAction) {
    const actionBtn = document.getElementById(`${toastId}-action`);
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        onAction();
        dismiss();
      });
    }
  }

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return { dismiss, id: toastId };
}

/**
 * Clears all visible toasts.
 */
export function clearAllToasts() {
  const container = document.getElementById('toast-container');
  if (container) container.innerHTML = '';
}

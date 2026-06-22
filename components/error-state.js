/**
 * error-state.js — Error State Component
 * Renders error UI with retry option.
 * 
 * @module components/error-state
 */

/**
 * Renders an error state UI.
 * @param {Object} options
 * @param {string}   options.title       — Error title (default: "Kuch galat ho gaya!")
 * @param {string}   options.message     — Error description
 * @param {string}   options.retryAction — Inline JS for retry button click
 * @param {string}   options.retryText   — Retry button text (default: "Dobara Try Karein")
 * @param {string}   options.icon        — Custom error icon SVG
 * @param {string}   options.className   — Additional CSS classes
 * @param {boolean}  options.showHome    — Show "Go Home" link
 * @returns {string} HTML string
 */
export function renderErrorState(options = {}) {
  const {
    title = 'Kuch galat ho gaya!',
    message = 'Kripya dobara try karein. Agar problem bani rahe toh support se contact karein.',
    retryAction = 'window.location.reload()',
    retryText = 'Dobara Try Karein',
    icon = '',
    className = '',
    showHome = false
  } = options;

  const errorIcon = icon || `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  `;

  const retryHtml = retryAction
    ? `<button class="btn btn--primary btn--lg error-state__retry" onclick="${retryAction}">
        <span class="btn__icon btn__icon--left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </span>
        <span class="btn__text">${retryText}</span>
       </button>`
    : '';

  const homeHtml = showHome
    ? `<a href="#/" class="error-state__home-link">← Ghar Wapas Jayein</a>`
    : '';

  return `
    <div class="error-state ${className}">
      <div class="error-state__icon">
        ${errorIcon}
      </div>
      <h3 class="error-state__title">${title}</h3>
      <p class="error-state__message">${message}</p>
      <div class="error-state__actions">
        ${retryHtml}
        ${homeHtml}
      </div>
    </div>
  `;
}

/**
 * Renders a compact inline error message (for within cards/sections).
 * @param {string} message — Error message
 * @param {string} retryAction — Inline JS for retry
 * @returns {string} HTML string
 */
export function renderInlineError(message, retryAction = '') {
  const retryHtml = retryAction
    ? `<button class="inline-error__retry" onclick="${retryAction}">Retry</button>`
    : '';

  return `
    <div class="inline-error" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span class="inline-error__message">${message}</span>
      ${retryHtml}
    </div>
  `;
}

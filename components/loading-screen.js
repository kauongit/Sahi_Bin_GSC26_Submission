/**
 * loading-screen.js — Loading & Skeleton Components
 * Full-screen loading overlay and skeleton placeholder states.
 * 
 * @module components/loading-screen
 */

/**
 * Renders a full-screen loading overlay.
 * @param {string} message — Loading message text (default: "Loading...")
 * @returns {string} HTML string
 */
export function renderLoadingScreen(message = 'Loading...') {
  return `
    <div class="loading-screen">
      <div class="loading-screen__content">
        <div class="loading-screen__icon">
          <svg class="loading-screen__spinner" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
          </svg>
        </div>
        <p class="loading-screen__message">${message}</p>
      </div>
    </div>
  `;
}

/**
 * Renders a smaller inline loading spinner.
 * @param {string} message — Loading message
 * @param {string} size    — Spinner size: 'sm' | 'md' | 'lg'
 * @returns {string} HTML string
 */
export function renderSpinner(message = '', size = 'md') {
  const sizeMap = { sm: 24, md: 40, lg: 64 };
  const px = sizeMap[size] || sizeMap.md;

  return `
    <div class="spinner spinner--${size}">
      <svg class="spinner__icon" width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
      </svg>
      ${message ? `<span class="spinner__text">${message}</span>` : ''}
    </div>
  `;
}

/**
 * Renders a skeleton loading card.
 * @param {Object} options
 * @param {string} options.height — Card height (default: '120px')
 * @param {string} options.className — Additional CSS classes
 * @returns {string} HTML string
 */
export function renderSkeletonCard(options = {}) {
  const { height = '120px', className = '' } = options;

  return `
    <div class="skeleton-card ${className}" style="height: ${height};">
      <div class="skeleton-card__header">
        <div class="skeleton skeleton--circle" style="width: 40px; height: 40px;"></div>
        <div class="skeleton-card__header-text">
          <div class="skeleton skeleton--text" style="width: 60%; height: 14px;"></div>
          <div class="skeleton skeleton--text" style="width: 40%; height: 12px; margin-top: 6px;"></div>
        </div>
      </div>
      <div class="skeleton-card__body">
        <div class="skeleton skeleton--text" style="width: 100%; height: 12px;"></div>
        <div class="skeleton skeleton--text" style="width: 80%; height: 12px; margin-top: 8px;"></div>
      </div>
    </div>
  `;
}

/**
 * Renders a list of skeleton cards.
 * @param {number} count — Number of skeleton cards (default: 3)
 * @param {Object} options — Passed to each renderSkeletonCard
 * @returns {string} HTML string
 */
export function renderSkeletonList(count = 3, options = {}) {
  const items = Array.from({ length: count }, () => renderSkeletonCard(options)).join('');
  return `
    <div class="skeleton-list">
      ${items}
    </div>
  `;
}

/**
 * Renders skeleton text lines.
 * @param {number} lines — Number of text lines (default: 3)
 * @returns {string} HTML string
 */
export function renderSkeletonText(lines = 3) {
  const widths = ['100%', '92%', '85%', '78%', '95%', '88%', '70%', '96%'];
  const linesHtml = Array.from({ length: lines }, (_, i) => {
    const width = widths[i % widths.length];
    return `<div class="skeleton skeleton--text" style="width: ${width}; height: 14px; margin-bottom: 10px;"></div>`;
  }).join('');

  return `
    <div class="skeleton-text">
      ${linesHtml}
    </div>
  `;
}

/**
 * Renders a skeleton stat tile row (for dashboard loading).
 * @param {number} count — Number of tiles (default: 3)
 * @returns {string} HTML string
 */
export function renderSkeletonStatRow(count = 3) {
  const tiles = Array.from({ length: count }, () => `
    <div class="skeleton-tile">
      <div class="skeleton skeleton--circle" style="width: 36px; height: 36px;"></div>
      <div class="skeleton skeleton--text" style="width: 50px; height: 24px; margin-top: 8px;"></div>
      <div class="skeleton skeleton--text" style="width: 70px; height: 12px; margin-top: 4px;"></div>
    </div>
  `).join('');

  return `
    <div class="skeleton-stat-row">
      ${tiles}
    </div>
  `;
}

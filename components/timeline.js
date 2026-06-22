/**
 * timeline.js — Vertical Timeline Component
 * Renders a vertical timeline with connected nodes and content cards.
 * 
 * @module components/timeline
 */

/**
 * Status-to-color mapping
 */
const STATUS_COLORS = {
  completed: '#1B6B3C',
  success:   '#1B6B3C',
  active:    '#3366FF',
  pending:   '#F9A825',
  warning:   '#F9A825',
  failed:    '#D32F2F',
  error:     '#D32F2F',
  default:   '#999999'
};

/**
 * Default status icons (small SVGs)
 */
const STATUS_ICONS = {
  completed: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  success:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  active:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" fill="#fff"/></svg>`,
  pending:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  warning:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  failed:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  error:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  default:   ''
};

/**
 * Renders a vertical timeline.
 * @param {Array} items — Array of timeline items
 * @param {string}  items[].date        — Date/time string (left column)
 * @param {string}  items[].title       — Event title
 * @param {string}  items[].description — Event description
 * @param {string}  items[].status      — Status key for color coding
 * @param {string}  items[].icon        — Custom icon SVG (overrides status icon)
 * @param {string}  items[].color       — Custom node color (overrides status color)
 * @param {string}  items[].badge       — Optional badge text
 * @param {Object} options
 * @param {string}  options.className   — Additional CSS classes
 * @returns {string} HTML string
 */
export function renderTimeline(items = [], options = {}) {
  const { className = '' } = options;

  if (items.length === 0) {
    return `<div class="timeline timeline--empty ${className}">
              <p class="timeline__empty-text">Koi event nahi hai</p>
            </div>`;
  }

  const itemsHtml = items.map((item, index) => {
    const {
      date = '',
      title = '',
      description = '',
      status = 'default',
      icon = '',
      color = '',
      badge = ''
    } = item;

    const nodeColor = color || STATUS_COLORS[status] || STATUS_COLORS.default;
    const nodeIcon = icon || STATUS_ICONS[status] || '';
    const isLast = index === items.length - 1;

    const badgeHtml = badge
      ? `<span class="timeline__badge" style="background-color: ${nodeColor}20; color: ${nodeColor}; border: 2px solid ${nodeColor};">${badge}</span>`
      : '';

    return `
      <div class="timeline__item ${isLast ? 'timeline__item--last' : ''}">
        <!-- Date column -->
        <div class="timeline__date">
          <span class="timeline__date-text">${date}</span>
        </div>

        <!-- Node & connector line -->
        <div class="timeline__node-column">
          <div class="timeline__node" style="background-color: ${nodeColor}; border-color: ${nodeColor};">
            ${nodeIcon}
          </div>
          ${!isLast
            ? `<div class="timeline__connector" style="background-color: ${nodeColor}33;"></div>`
            : ''
          }
        </div>

        <!-- Content column -->
        <div class="timeline__content">
          <div class="timeline__content-card">
            <div class="timeline__content-header">
              <h4 class="timeline__title">${title}</h4>
              ${badgeHtml}
            </div>
            ${description
              ? `<p class="timeline__description">${description}</p>`
              : ''
            }
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="timeline ${className}">
      ${itemsHtml}
    </div>
  `;
}

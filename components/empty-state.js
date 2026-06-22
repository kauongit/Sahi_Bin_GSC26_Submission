/**
 * empty-state.js — Empty State Component
 * Renders empty/zero-data state UIs with icons and CTAs.
 * 
 * @module components/empty-state
 */

/* ──────────────────────────────────────────────
   Preset Empty State Configurations
   ────────────────────────────────────────────── */

/** Empty collections / pickups */
export const EMPTY_COLLECTIONS = {
  icon: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M3 6h18l-1.5 13H4.5L3 6z"/>
           <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
           <polyline points="23 4 23 10 17 10"/>
           <polyline points="1 20 1 14 7 14"/>
         </svg>`,
  title: 'Koi Collection Nahi Hai',
  message: 'Aaj ki koi collection abhi tak nahi hui. Naya scan shuru karein!',
  actionText: 'Scan Shuru Karein',
  actionRoute: '#/worker/scan'
};

/** Empty complaints list */
export const EMPTY_COMPLAINTS = {
  icon: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
           <line x1="9" y1="9" x2="15" y2="9"/>
           <line x1="12" y1="6" x2="12" y2="12"/>
         </svg>`,
  title: 'Koi Shikayat Nahi',
  message: 'Bahut accha! Abhi tak koi shikayat nahi aayi hai.',
  actionText: '',
  actionRoute: ''
};

/** Empty notifications */
export const EMPTY_NOTIFICATIONS = {
  icon: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
           <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
         </svg>`,
  title: 'Koi Notification Nahi',
  message: 'Abhi koi naya notification nahi hai. Baad mein check karein.',
  actionText: '',
  actionRoute: ''
};

/** Empty rewards / leaderboard */
export const EMPTY_REWARDS = {
  icon: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F9A825" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="8" r="7"/>
           <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
         </svg>`,
  title: 'Abhi Koi Inaam Nahi',
  message: 'Zyada kaam karein aur inaam jeeten! Leaderboard mein apni jagah banayein.',
  actionText: 'Kaam Shuru Karein',
  actionRoute: '#/worker/scan'
};

/** Empty penalties */
export const EMPTY_PENALTIES = {
  icon: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
           <polyline points="9 12 11 14 15 10"/>
         </svg>`,
  title: 'Koi Penalty Nahi! 🎉',
  message: 'Bahut badhiya! Aap par koi penalty nahi lagi hai. Aise hi kaam karte rahein!',
  actionText: '',
  actionRoute: ''
};

/**
 * Renders an empty state UI.
 * @param {Object} options
 * @param {string} options.icon        — SVG icon HTML (large, centered)
 * @param {string} options.title       — Title text (Hindi)
 * @param {string} options.message     — Description message
 * @param {string} options.actionText  — CTA button text (optional)
 * @param {string} options.actionRoute — CTA button route/href (optional)
 * @param {string} options.className   — Additional CSS classes
 * @returns {string} HTML string
 */
export function renderEmptyState(options = {}) {
  const {
    icon = '',
    title = 'Kuch Nahi Mila',
    message = 'Abhi yahaan kuch nahi hai.',
    actionText = '',
    actionRoute = '',
    className = ''
  } = options;

  const actionHtml = actionText && actionRoute
    ? `<a href="${actionRoute}" class="btn btn--primary btn--lg empty-state__action">
        ${actionText}
       </a>`
    : '';

  return `
    <div class="empty-state ${className}">
      ${icon
        ? `<div class="empty-state__icon">${icon}</div>`
        : ''
      }
      <h3 class="empty-state__title">${title}</h3>
      <p class="empty-state__message">${message}</p>
      ${actionHtml}
    </div>
  `;
}

/**
 * bottom-nav.js — Bottom Tab Navigation
 * Renders the fixed bottom navigation bar with icon tabs.
 * 
 * @module components/bottom-nav
 */

import {
  iconHome, iconScan, iconProfile, iconQR,
  iconHistory, iconReward, iconHouse
} from '../js/icons.js';

/* ──────────────────────────────────────────────
   Tab Preset Configurations
   ────────────────────────────────────────────── */

/** Worker Dashboard bottom tabs */
export const WORKER_HOME_TABS = [
  { id: 'home',    icon: iconHome,    label: 'HOME',     route: '#/worker/dashboard' },
  { id: 'work',    icon: iconScan,    label: 'KAM KAAJ', route: '#/worker/scan' },
  { id: 'profile', icon: iconProfile, label: 'PROFILE',  route: '#/worker/profile' }
];

/** Worker Scan / QR flow tabs */
export const WORKER_SCAN_TABS = [
  { id: 'dashboard', icon: iconHome,    label: 'Dashboard',   route: '#/worker/dashboard' },
  { id: 'scan',      icon: iconQR,      label: 'Scan',        route: '#/worker/scan' },
  { id: 'history',   icon: iconHistory,  label: 'Puraani List', route: '#/worker/history' }
];

/** Worker Performance tabs */
export const WORKER_PERF_TABS = [
  { id: 'ghar',   icon: iconHouse,   label: 'Ghar',    route: '#/worker/dashboard' },
  { id: 'scan',   icon: iconQR,      label: 'Scan',    route: '#/worker/scan' },
  { id: 'itihaas', icon: iconHistory, label: 'Itihaas', route: '#/worker/performance' },
  { id: 'inaam',  icon: iconReward,   label: 'Inaam',   route: '#/worker/leaderboard' }
];

/** Citizen bottom tabs */
export const CITIZEN_TABS = [
  { id: 'home',    icon: iconHome,    label: 'HOME',    route: '#/citizen/dashboard' },
  { id: 'itihaas', icon: iconHistory, label: 'ITIHAAS', route: '#/citizen/history' },
  { id: 'inaam',   icon: iconReward,  label: 'INAAM',   route: '#/citizen/rewards' },
  { id: 'profile', icon: iconProfile, label: 'PROFILE', route: '#/citizen/profile' }
];

/**
 * Renders the bottom navigation bar.
 * @param {Array}  tabs        — Array of { id, icon, label, route }
 * @param {string} activeRoute — The current hash route to mark as active
 * @returns {string} HTML string
 */
export function renderBottomNav(tabs, activeRoute) {
  const currentRoute = activeRoute || window.location.hash;

  const tabsHtml = tabs.map(tab => {
    const isActive = currentRoute === tab.route;
    const activeClass = isActive ? 'bottom-nav__tab--active' : '';

    return `
      <a href="${tab.route}"
         class="bottom-nav__tab ${activeClass}"
         aria-label="${tab.label}"
         ${isActive ? 'aria-current="page"' : ''}>
        <span class="bottom-nav__icon">${tab.icon}</span>
        <span class="bottom-nav__label">${tab.label}</span>
      </a>
    `;
  }).join('');

  return `
    <nav class="bottom-nav" aria-label="Main navigation">
      ${tabsHtml}
    </nav>
  `;
}

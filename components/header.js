/**
 * header.js — App Header & Slide Menu
 * Renders the top app bar and hamburger slide-out menu.
 * 
 * @module components/header
 */

import { iconMenu, iconBack, iconClose, iconLogout, iconProfile, iconSettings } from '../js/icons.js';

/**
 * Renders the app header bar.
 * @param {Object} options
 * @param {string}  options.title        — Header title text
 * @param {boolean} options.showMenu     — Show hamburger icon (left)
 * @param {boolean} options.showAvatar   — Show avatar circle (right)
 * @param {string}  options.roleBadge    — Optional role badge text ("WORKER MODE")
 * @param {string}  options.avatarUrl    — Avatar image URL (falls back to initials)
 * @param {string}  options.onMenuClick  — Inline JS for menu click
 * @param {string}  options.onAvatarClick — Inline JS for avatar click
 * @param {boolean} options.backButton   — Show back arrow instead of hamburger
 * @param {string}  options.onBackClick  — Inline JS for back click
 * @returns {string} HTML string
 */
export function renderHeader(options = {}) {
  const {
    title = 'Sahi Bin',
    showMenu = true,
    showAvatar = true,
    roleBadge = '',
    avatarUrl = '',
    onMenuClick = "document.getElementById('slide-menu').classList.add('slide-menu--open')",
    onAvatarClick = "window.location.hash = '#/profile'",
    backButton = false,
    onBackClick = "window.history.back()"
  } = options;

  // Left action: back arrow or hamburger
  const leftAction = backButton
    ? `<button class="header__action-btn" onclick="${onBackClick}" aria-label="Go back">
        ${iconBack}
       </button>`
    : showMenu
    ? `<button class="header__action-btn" onclick="${onMenuClick}" aria-label="Open menu">
        ${iconMenu}
       </button>`
    : '<div class="header__action-spacer"></div>';

  // Role badge (e.g., "WORKER MODE")
  const badgeHtml = roleBadge
    ? `<span class="header__role-badge">${roleBadge}</span>`
    : '';

  // Avatar on the right
  const avatarHtml = showAvatar
    ? `<button class="header__avatar-btn" onclick="${onAvatarClick}" aria-label="Profile">
        ${avatarUrl
          ? `<img class="header__avatar-img" src="${avatarUrl}" alt="Avatar" />`
          : `<span class="header__avatar-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
            </span>`
        }
       </button>`
    : '<div class="header__action-spacer"></div>';

  return `
    <header class="header">
      <div class="header__left">
        ${leftAction}
      </div>
      <div class="header__center">
        <h1 class="header__title">${title}</h1>
        ${badgeHtml}
      </div>
      <div class="header__right">
        ${avatarHtml}
      </div>
    </header>
  `;
}

/**
 * Renders the slide-out navigation menu panel.
 * @param {Object} options
 * @param {string}  options.userName     — User display name
 * @param {string}  options.userRole     — User role (Worker / Citizen)
 * @param {string}  options.avatarUrl    — Avatar image URL
 * @param {Array}   options.menuItems    — Array of { icon, label, route, active }
 * @param {string}  options.onClose      — Inline JS for close button
 * @param {string}  options.onLogout     — Inline JS for logout
 * @returns {string} HTML string
 */
export function renderSlideMenu(options = {}) {
  const {
    userName = 'User',
    userRole = 'Citizen',
    avatarUrl = '',
    menuItems = [],
    onClose = "document.getElementById('slide-menu').classList.remove('slide-menu--open')",
    onLogout = "window.location.hash = '#/login'"
  } = options;

  const avatarHtml = avatarUrl
    ? `<img class="slide-menu__avatar-img" src="${avatarUrl}" alt="Avatar" />`
    : `<div class="slide-menu__avatar-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
        </svg>
       </div>`;

  const menuItemsHtml = menuItems.map(item => `
    <a href="${item.route}" class="slide-menu__item ${item.active ? 'slide-menu__item--active' : ''}" onclick="${onClose}">
      <span class="slide-menu__item-icon">${item.icon || ''}</span>
      <span class="slide-menu__item-label">${item.label}</span>
    </a>
  `).join('');

  return `
    <div id="slide-menu" class="slide-menu">
      <div class="slide-menu__overlay" onclick="${onClose}"></div>
      <div class="slide-menu__panel">
        <!-- Menu Header -->
        <div class="slide-menu__header">
          <div class="slide-menu__user-info">
            <div class="slide-menu__avatar">
              ${avatarHtml}
            </div>
            <div class="slide-menu__user-text">
              <span class="slide-menu__user-name">${userName}</span>
              <span class="slide-menu__user-role">${userRole}</span>
            </div>
          </div>
          <button class="slide-menu__close-btn" onclick="${onClose}" aria-label="Close menu">
            ${iconClose}
          </button>
        </div>

        <!-- Menu Items -->
        <nav class="slide-menu__nav">
          ${menuItemsHtml}
        </nav>

        <!-- Logout -->
        <div class="slide-menu__footer">
          <button class="slide-menu__logout-btn" onclick="${onLogout}">
            ${iconLogout}
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

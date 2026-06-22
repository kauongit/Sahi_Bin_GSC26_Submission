/**
 * Sahi Bin - SVG Icon Registry
 * Each function returns a clean SVG string with currentColor fill and configurable size.
 * All icons use viewBox="0 0 24 24" for consistent sizing.
 */

/**
 * Create an SVG wrapper with standard attributes.
 * @param {string} paths - SVG inner content (path elements)
 * @param {number} size - Width/height in pixels
 * @returns {string} Complete SVG element string
 */
function svg(paths, size = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/** Filled SVG wrapper (no stroke, uses fill) */
function svgFilled(paths, size = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="none">${paths}</svg>`;
}

// ============================================================================
// NAVIGATION ICONS
// ============================================================================

export function iconHome(size = 24) {
  return svg(`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`, size);
}

export function iconScan(size = 24) {
  return svg(`<path d="M23 6V1h-5"/><path d="M1 6V1h5"/><path d="M23 18v5h-5"/><path d="M1 18v5h5"/><line x1="1" y1="12" x2="23" y2="12"/>`, size);
}

export function iconHistory(size = 24) {
  return svg(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, size);
}

export function iconProfile(size = 24) {
  return svg(`<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`, size);
}

export function iconReward(size = 24) {
  return svg(`<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`, size);
}

export function iconMenu(size = 24) {
  return svg(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`, size);
}

export function iconBack(size = 24) {
  return svg(`<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`, size);
}

export function iconClose(size = 24) {
  return svg(`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`, size);
}

// ============================================================================
// ACTION ICONS
// ============================================================================

export function iconCamera(size = 24) {
  return svg(`<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`, size);
}

export function iconQR(size = 24) {
  return svg(`<rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4" rx="0.5"/><line x1="22" y1="14" x2="22" y2="22"/><line x1="14" y1="22" x2="22" y2="22"/>`, size);
}

export function iconCheck(size = 24) {
  return svg(`<polyline points="20 6 9 17 4 12"/>`, size);
}

export function iconCross(size = 24) {
  return svg(`<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`, size);
}

export function iconEdit(size = 24) {
  return svg(`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`, size);
}

export function iconTrash(size = 24) {
  return svg(`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`, size);
}

export function iconSearch(size = 24) {
  return svg(`<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`, size);
}

export function iconFilter(size = 24) {
  return svg(`<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`, size);
}

// ============================================================================
// WASTE TYPE ICONS
// ============================================================================

export function iconLeaf(size = 24) {
  return svg(`<path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75"/><path d="M14 17c-2-1-3.5-3-4-6"/>`, size);
}

export function iconRecycle(size = 24) {
  return svg(`<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="M14 16l3 3-3 3"/><path d="m8.293 13.596-4.6-7.96a1.83 1.83 0 0 1 .01-1.78A1.785 1.785 0 0 1 5.26 3h2.474"/><path d="m11.39 6.28 1.61-2.78"/><path d="m14 3-3 3-3-3"/><path d="M19.533 13.596 16.96 8.67a1.82 1.82 0 0 0-1.56-.87H13.5"/><path d="m7 9 1 3.5"/>`, size);
}

export function iconMixed(size = 24) {
  return svg(`<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001"/><path d="M21 16.0586V7.94153C21 7.59889 20.8193 7.2816 20.5229 7.10947L12.5229 2.60947C12.2003 2.42282 11.7997 2.42282 11.4771 2.60947L3.47706 7.10947C3.18071 7.2816 3 7.59889 3 7.94153V16.0586C3 16.4012 3.18071 16.7185 3.47706 16.8906L11.4771 21.3906C11.7997 21.5773 12.2003 21.5773 12.5229 21.3906L20.5229 16.8906C20.8193 16.7185 21 16.4012 21 16.0586Z"/>`, size);
}

// ============================================================================
// STATUS ICONS
// ============================================================================

export function iconWarning(size = 24) {
  return svg(`<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`, size);
}

export function iconInfo(size = 24) {
  return svg(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`, size);
}

export function iconNotification(size = 24) {
  return svg(`<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`, size);
}

export function iconGPS(size = 24) {
  return svg(`<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`, size);
}

export function iconOffline(size = 24) {
  return svg(`<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`, size);
}

export function iconSync(size = 24) {
  return svg(`<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`, size);
}

// ============================================================================
// NAVIGATION & DIRECTION ICONS
// ============================================================================

export function iconChevronRight(size = 24) {
  return svg(`<polyline points="9 18 15 12 9 6"/>`, size);
}

export function iconChevronDown(size = 24) {
  return svg(`<polyline points="6 9 12 15 18 9"/>`, size);
}

export function iconPlus(size = 24) {
  return svg(`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`, size);
}

export function iconMinus(size = 24) {
  return svg(`<line x1="5" y1="12" x2="19" y2="12"/>`, size);
}

// ============================================================================
// OBJECT ICONS
// ============================================================================

export function iconCalendar(size = 24) {
  return svg(`<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`, size);
}

export function iconTimeline(size = 24) {
  return svg(`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`, size);
}

export function iconStar(size = 24) {
  return svg(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`, size);
}

export function iconTrophy(size = 24) {
  return svg(`<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`, size);
}

export function iconTruck(size = 24) {
  return svg(`<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`, size);
}

export function iconHouse(size = 24) {
  return svg(`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`, size);
}

export function iconUser(size = 24) {
  return svg(`<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`, size);
}

export function iconPhone(size = 24) {
  return svg(`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`, size);
}

export function iconEmail(size = 24) {
  return svg(`<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`, size);
}

export function iconLock(size = 24) {
  return svg(`<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`, size);
}

export function iconEye(size = 24) {
  return svg(`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`, size);
}

export function iconEyeOff(size = 24) {
  return svg(`<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`, size);
}

export function iconUpload(size = 24) {
  return svg(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`, size);
}

export function iconRefresh(size = 24) {
  return svg(`<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>`, size);
}

export function iconSettings(size = 24) {
  return svg(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`, size);
}

export function iconLogout(size = 24) {
  return svg(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`, size);
}

// ============================================================================
// DOMAIN-SPECIFIC ICONS
// ============================================================================

export function iconComplaint(size = 24) {
  return svg(`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="11"/><line x1="12" y1="14" x2="12.01" y2="14"/>`, size);
}

export function iconPenalty(size = 24) {
  return svg(`<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`, size);
}

export function iconSustainability(size = 24) {
  return svg(`<path d="M2 22c1.25-1.25 2.5-3.642 2.5-6.5 0-4.694 3.806-8.5 8.5-8.5 1.19 0 2.325.244 3.354.686"/><path d="M22 2L13.5 10.5"/><path d="M16 7c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3"/><path d="M12 15c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3"/>`, size);
}

export function iconHelp(size = 24) {
  return svg(`<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`, size);
}

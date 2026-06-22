/**
 * stat-tile.js — Color-coded Stat Tile
 * Renders GEELA / SOOKHA / MILA-JULA stat tiles for worker dashboard.
 * 
 * @module components/stat-tile
 */

/**
 * Variant color configurations
 */
const VARIANT_COLORS = {
  wet: {
    bg: '#A5D6A7',
    border: '#1A1A1A',
    text: '#1A1A1A',
    iconBg: '#1B6B3C'
  },
  dry: {
    bg: '#B3C6FF',
    border: '#1A1A1A',
    text: '#1A1A1A',
    iconBg: '#3366FF'
  },
  mixed: {
    bg: '#FFE082',
    border: '#1A1A1A',
    text: '#1A1A1A',
    iconBg: '#F9A825'
  },
  default: {
    bg: '#FFFFFF',
    border: '#1A1A1A',
    text: '#1A1A1A',
    iconBg: '#1B6B3C'
  },
  danger: {
    bg: '#FFCDD2',
    border: '#1A1A1A',
    text: '#1A1A1A',
    iconBg: '#D32F2F'
  },
  total: {
    bg: '#E8F5E9',
    border: '#1A1A1A',
    text: '#1A1A1A',
    iconBg: '#1B6B3C'
  }
};

/**
 * Renders a color-coded stat tile.
 * @param {Object} options
 * @param {string} options.icon     — SVG icon HTML string
 * @param {string} options.label    — Tile label (e.g., "GEELA")
 * @param {string|number} options.value — Stat value (e.g., "23 kg")
 * @param {'wet'|'dry'|'mixed'|'default'|'danger'|'total'} options.variant — Color variant
 * @param {string} options.onClick  — Inline JS for click handler
 * @param {string} options.subLabel — Optional sub-label text
 * @param {string} options.id       — Element id
 * @returns {string} HTML string
 */
export function renderStatTile(options = {}) {
  const {
    icon = '',
    label = '',
    value = '0',
    variant = 'default',
    onClick = '',
    subLabel = '',
    id = ''
  } = options;

  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.default;
  const clickAttr = onClick ? `onclick="${onClick}" role="button" tabindex="0"` : '';
  const cursorStyle = onClick ? 'cursor: pointer;' : '';
  const idAttr = id ? `id="${id}"` : '';
  const subLabelHtml = subLabel ? `<span class="stat-tile__sub-label">${subLabel}</span>` : '';

  return `
    <div class="stat-tile stat-tile--${variant}"
         ${idAttr}
         style="background-color: ${colors.bg}; border-color: ${colors.border}; ${cursorStyle}"
         ${clickAttr}>
      ${icon
        ? `<div class="stat-tile__icon" style="background-color: ${colors.iconBg};">
            ${icon}
           </div>`
        : ''
      }
      <div class="stat-tile__content">
        <span class="stat-tile__value">${value}</span>
        <span class="stat-tile__label">${label}</span>
        ${subLabelHtml}
      </div>
    </div>
  `;
}

/**
 * Renders a row of stat tiles.
 * @param {Array} tiles — Array of tile option objects
 * @returns {string} HTML string
 */
export function renderStatTileRow(tiles = []) {
  const tilesHtml = tiles.map(tile => renderStatTile(tile)).join('');
  return `
    <div class="stat-tile-row">
      ${tilesHtml}
    </div>
  `;
}

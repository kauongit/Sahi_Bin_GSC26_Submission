/**
 * brutalist-card.js — Neo-Brutalist Card Component
 * Renders a card with thick borders and offset shadows.
 * 
 * @module components/brutalist-card
 */

/**
 * Renders a Neo-Brutalist styled card.
 * @param {string} content  — Inner HTML content of the card
 * @param {Object} options
 * @param {'default'|'elevated'|'colored'|'flat'} options.variant — Card style variant
 * @param {string}  options.bgColor   — Custom background color override
 * @param {string}  options.className  — Additional CSS classes
 * @param {string}  options.onClick    — Inline JS for click handler
 * @param {string}  options.id         — Element id
 * @param {string}  options.padding    — Custom padding override
 * @returns {string} HTML string
 */
export function renderBrutalistCard(content, options = {}) {
  const {
    variant = 'default',
    bgColor = '',
    className = '',
    onClick = '',
    id = '',
    padding = ''
  } = options;

  const variantClass = `brutalist-card--${variant}`;
  const bgStyle = bgColor ? `background-color: ${bgColor};` : '';
  const paddingStyle = padding ? `padding: ${padding};` : '';
  const inlineStyle = (bgStyle || paddingStyle) ? `style="${bgStyle}${paddingStyle}"` : '';
  const clickAttr = onClick ? `onclick="${onClick}" role="button" tabindex="0"` : '';
  const idAttr = id ? `id="${id}"` : '';
  const cursorClass = onClick ? 'brutalist-card--clickable' : '';

  return `
    <div class="brutalist-card ${variantClass} ${cursorClass} ${className}"
         ${idAttr}
         ${inlineStyle}
         ${clickAttr}>
      ${content}
    </div>
  `;
}

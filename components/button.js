/**
 * button.js — Neo-Brutalist Button Component
 * Renders buttons with thick borders and offset shadows.
 * 
 * @module components/button
 */

/**
 * Renders a Neo-Brutalist styled button.
 * @param {string} text — Button label text
 * @param {Object} options
 * @param {'primary'|'secondary'|'danger'|'outline'|'ghost'} options.variant — Button style
 * @param {'default'|'sm'|'lg'}  options.size      — Button size
 * @param {boolean} options.block     — Full-width button
 * @param {string}  options.icon      — SVG icon HTML (prepended to text)
 * @param {string}  options.iconRight — SVG icon HTML (appended after text)
 * @param {boolean} options.disabled  — Disabled state
 * @param {string}  options.id        — Element id
 * @param {string}  options.type      — Button type attribute (button/submit/reset)
 * @param {string}  options.className — Additional CSS classes
 * @param {string}  options.onClick   — Inline JS for click handler
 * @param {string}  options.ariaLabel — Accessibility label
 * @param {string}  options.href      — If provided, renders an <a> instead of <button>
 * @returns {string} HTML string
 */
export function renderButton(text, options = {}) {
  const {
    variant = 'primary',
    size = 'default',
    block = false,
    icon = '',
    iconRight = '',
    disabled = false,
    id = '',
    type = 'button',
    className = '',
    onClick = '',
    ariaLabel = '',
    href = ''
  } = options;

  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block ? 'btn--block' : '',
    disabled ? 'btn--disabled' : '',
    icon && !text ? 'btn--icon-only' : '',
    className
  ].filter(Boolean).join(' ');

  const idAttr = id ? `id="${id}"` : '';
  const disabledAttr = disabled ? 'disabled aria-disabled="true"' : '';
  const clickAttr = onClick && !disabled ? `onclick="${onClick}"` : '';
  const ariaAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';

  const iconHtml = icon ? `<span class="btn__icon btn__icon--left">${icon}</span>` : '';
  const iconRightHtml = iconRight ? `<span class="btn__icon btn__icon--right">${iconRight}</span>` : '';
  const textHtml = text ? `<span class="btn__text">${text}</span>` : '';

  const innerContent = `${iconHtml}${textHtml}${iconRightHtml}`;

  // Render as <a> tag if href is provided
  if (href) {
    return `
      <a href="${href}"
         class="${classes}"
         ${idAttr}
         ${ariaAttr}
         ${clickAttr}>
        ${innerContent}
      </a>
    `;
  }

  return `
    <button type="${type}"
            class="${classes}"
            ${idAttr}
            ${disabledAttr}
            ${clickAttr}
            ${ariaAttr}>
      ${innerContent}
    </button>
  `;
}

/**
 * Renders a floating action button (FAB).
 * @param {string} icon    — SVG icon HTML
 * @param {Object} options
 * @param {string} options.onClick  — Inline JS for click
 * @param {string} options.ariaLabel — Accessibility label
 * @param {string} options.id       — Element id
 * @param {string} options.className — Extra classes
 * @returns {string} HTML string
 */
export function renderFAB(icon, options = {}) {
  const {
    onClick = '',
    ariaLabel = 'Action',
    id = '',
    className = ''
  } = options;

  const idAttr = id ? `id="${id}"` : '';
  const clickAttr = onClick ? `onclick="${onClick}"` : '';

  return `
    <button class="fab ${className}"
            ${idAttr}
            ${clickAttr}
            aria-label="${ariaLabel}">
      ${icon}
    </button>
  `;
}

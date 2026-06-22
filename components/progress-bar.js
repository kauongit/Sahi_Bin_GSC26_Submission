/**
 * progress-bar.js — Progress Bar Component
 * Renders the green progress bar matching the AAJ KA KAAM card.
 * 
 * @module components/progress-bar
 */

/**
 * Renders a Neo-Brutalist progress bar.
 * @param {number} current — Current progress value
 * @param {number} total   — Total/max value
 * @param {Object} options
 * @param {boolean} options.showLabel   — Show the label text (e.g., "15/30")
 * @param {string}  options.labelFormat — Label format: 'fraction' | 'percentage' | 'custom'
 * @param {string}  options.customLabel — Custom label text (when labelFormat = 'custom')
 * @param {string}  options.height      — Bar height CSS value (default: '20px')
 * @param {string}  options.color       — Bar fill color (default: primary green)
 * @param {string}  options.trackColor  — Track background color
 * @param {string}  options.id          — Element id
 * @param {boolean} options.animate     — Animate the bar fill (default: true)
 * @returns {string} HTML string
 */
export function renderProgressBar(current, total, options = {}) {
  const {
    showLabel = true,
    labelFormat = 'fraction',
    customLabel = '',
    height = '20px',
    color = 'var(--color-primary, #1B6B3C)',
    trackColor = 'var(--color-bg, #E0E0E0)',
    id = '',
    animate = true
  } = options;

  // Clamp percentage between 0-100
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.max(0, (current / safeTotal) * 100));
  const roundedPct = Math.round(percentage);

  // Build label text
  let labelText = '';
  if (showLabel) {
    switch (labelFormat) {
      case 'percentage':
        labelText = `${roundedPct}%`;
        break;
      case 'custom':
        labelText = customLabel;
        break;
      case 'fraction':
      default:
        labelText = `${current}/${total}`;
        break;
    }
  }

  const idAttr = id ? `id="${id}"` : '';
  const animateClass = animate ? 'progress-bar__fill--animated' : '';

  return `
    <div class="progress-bar" ${idAttr}>
      ${showLabel
        ? `<div class="progress-bar__header">
            <span class="progress-bar__label">${labelText}</span>
            <span class="progress-bar__percentage">${roundedPct}%</span>
           </div>`
        : ''
      }
      <div class="progress-bar__track" 
           style="height: ${height}; background-color: ${trackColor};"
           role="progressbar"
           aria-valuenow="${current}"
           aria-valuemin="0"
           aria-valuemax="${total}">
        <div class="progress-bar__fill ${animateClass}"
             style="width: ${roundedPct}%; background-color: ${color}; height: ${height};">
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders a progress bar with surrounding context card content.
 * Designed for the "AAJ KA KAAM" section.
 * @param {Object} options
 * @param {string} options.title   — Card title (e.g., "AAJ KA KAAM")
 * @param {number} options.current — Current value
 * @param {number} options.total   — Total value
 * @param {string} options.unit    — Unit label (e.g., "gharon mein")
 * @param {string} options.icon    — SVG icon HTML
 * @returns {string} HTML string
 */
export function renderProgressCard(options = {}) {
  const {
    title = 'AAJ KA KAAM',
    current = 0,
    total = 0,
    unit = 'gharon mein',
    icon = ''
  } = options;

  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.round(Math.min(100, Math.max(0, (current / safeTotal) * 100)));

  return `
    <div class="progress-card">
      <div class="progress-card__header">
        ${icon ? `<span class="progress-card__icon">${icon}</span>` : ''}
        <h3 class="progress-card__title">${title}</h3>
      </div>
      <div class="progress-card__stats">
        <span class="progress-card__current">${current}</span>
        <span class="progress-card__separator">/</span>
        <span class="progress-card__total">${total}</span>
        <span class="progress-card__unit">${unit}</span>
      </div>
      ${renderProgressBar(current, total, {
        showLabel: false,
        height: '16px',
        animate: true
      })}
      <span class="progress-card__percentage">${percentage}% complete</span>
    </div>
  `;
}

/**
 * score-circle.js — Circular Score/Progress Indicator
 * Renders an SVG circular progress ring with animated dash-array.
 * 
 * @module components/score-circle
 */

/**
 * Size configurations (diameter in px)
 */
const SIZE_CONFIG = {
  sm: { diameter: 64,  strokeWidth: 5,  fontSize: 16, labelSize: 10 },
  md: { diameter: 100, strokeWidth: 7,  fontSize: 28, labelSize: 12 },
  lg: { diameter: 140, strokeWidth: 9,  fontSize: 36, labelSize: 14 }
};

/**
 * Returns the color based on score value.
 * @param {number} score — 0-100
 * @returns {string} hex color
 */
function getScoreColor(score) {
  if (score < 40) return '#D32F2F';      // Red — danger
  if (score < 70) return '#F9A825';      // Amber — warning
  return '#1B6B3C';                       // Green — good
}

/**
 * Renders an SVG circular progress indicator.
 * @param {number} score — Score value (0-100)
 * @param {Object} options
 * @param {'sm'|'md'|'lg'} options.size — Circle size (default: 'md')
 * @param {string}  options.label          — Label text below score
 * @param {boolean} options.showPercentage — Show % sign after score
 * @param {string}  options.color          — Override score-based color
 * @param {string}  options.trackColor     — Track circle color
 * @param {string}  options.className      — Additional CSS classes
 * @param {string}  options.id             — Element id
 * @returns {string} HTML string (SVG)
 */
export function renderScoreCircle(score, options = {}) {
  const {
    size = 'md',
    label = '',
    showPercentage = true,
    color = '',
    trackColor = '#E0E0E0',
    className = '',
    id = ''
  } = options;

  // Clamp score to 0-100
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const { diameter, strokeWidth, fontSize, labelSize } = config;

  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;
  const center = diameter / 2;

  const strokeColor = color || getScoreColor(clampedScore);
  const displayText = showPercentage ? `${clampedScore}%` : `${clampedScore}`;

  const idAttr = id ? `id="${id}"` : '';

  // Label positioning
  const labelHtml = label
    ? `<text x="${center}" y="${center + fontSize * 0.6}"
            text-anchor="middle"
            font-family="'Inter', sans-serif"
            font-size="${labelSize}"
            font-weight="500"
            fill="#666">
        ${label}
       </text>`
    : '';

  // Adjust score text position based on whether label exists
  const scoreY = label ? center - 2 : center;

  return `
    <div class="score-circle score-circle--${size} ${className}" ${idAttr}>
      <svg width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}" class="score-circle__svg">
        <!-- Track circle (background) -->
        <circle cx="${center}"
                cy="${center}"
                r="${radius}"
                fill="none"
                stroke="${trackColor}"
                stroke-width="${strokeWidth}"
                class="score-circle__track" />

        <!-- Progress arc -->
        <circle cx="${center}"
                cy="${center}"
                r="${radius}"
                fill="none"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashOffset}"
                transform="rotate(-90 ${center} ${center})"
                class="score-circle__progress" />

        <!-- Score text -->
        <text x="${center}"
              y="${scoreY}"
              text-anchor="middle"
              dominant-baseline="central"
              font-family="'Inter', sans-serif"
              font-size="${fontSize}"
              font-weight="900"
              font-style="italic"
              fill="${strokeColor}"
              class="score-circle__value">
          ${displayText}
        </text>

        <!-- Label text -->
        ${labelHtml}
      </svg>
    </div>
  `;
}

/**
 * Renders a row of score circles (e.g., for multiple metrics).
 * @param {Array} scores — Array of { score, label, size }
 * @returns {string} HTML string
 */
export function renderScoreCircleRow(scores = []) {
  const circlesHtml = scores.map(s =>
    renderScoreCircle(s.score, {
      label: s.label || '',
      size: s.size || 'sm',
      showPercentage: s.showPercentage !== undefined ? s.showPercentage : true
    })
  ).join('');

  return `
    <div class="score-circle-row">
      ${circlesHtml}
    </div>
  `;
}

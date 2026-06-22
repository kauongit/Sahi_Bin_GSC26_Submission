/**
 * chart.js — Simple Chart Components (No Library)
 * Renders bar charts using CSS and line charts using SVG polyline.
 * 
 * @module components/chart
 */

/**
 * Renders a vertical bar chart using CSS.
 * @param {Array} data — Array of { label, value, color }
 * @param {Object} options
 * @param {string}  options.height     — Chart height (default: '200px')
 * @param {boolean} options.showLabels — Show bottom labels (default: true)
 * @param {boolean} options.showValues — Show value labels on top of bars (default: true)
 * @param {number}  options.maxValue   — Max value for scale (auto-calculated if not set)
 * @param {string}  options.title      — Chart title
 * @param {string}  options.className  — Additional CSS classes
 * @param {string}  options.barWidth   — CSS width for each bar (default: auto)
 * @param {string}  options.id         — Element id
 * @returns {string} HTML string
 */
export function renderBarChart(data = [], options = {}) {
  const {
    height = '200px',
    showLabels = true,
    showValues = true,
    maxValue = 0,
    title = '',
    className = '',
    barWidth = '',
    id = ''
  } = options;

  if (data.length === 0) {
    return `<div class="chart chart--empty ${className}">
              <p class="chart__empty-text">Koi data nahi hai</p>
            </div>`;
  }

  // Calculate max value for scaling
  const computedMax = maxValue > 0
    ? maxValue
    : Math.max(...data.map(d => d.value), 1);

  const idAttr = id ? `id="${id}"` : '';
  const barWidthStyle = barWidth ? `width: ${barWidth};` : `flex: 1;`;

  const barsHtml = data.map((item, index) => {
    const {
      label = '',
      value = 0,
      color = '#1B6B3C'
    } = item;

    const heightPercent = Math.round((value / computedMax) * 100);

    return `
      <div class="bar-chart__column" style="${barWidthStyle} max-width: 80px;">
        ${showValues
          ? `<span class="bar-chart__value">${value}</span>`
          : ''
        }
        <div class="bar-chart__bar-wrapper" style="height: ${height};">
          <div class="bar-chart__bar"
               style="height: ${heightPercent}%; background-color: ${color}; animation-delay: ${index * 80}ms;"
               title="${label}: ${value}">
          </div>
        </div>
        ${showLabels
          ? `<span class="bar-chart__label">${label}</span>`
          : ''
        }
      </div>
    `;
  }).join('');

  const titleHtml = title
    ? `<h4 class="bar-chart__title">${title}</h4>`
    : '';

  return `
    <div class="bar-chart ${className}" ${idAttr}>
      ${titleHtml}
      <div class="bar-chart__container">
        ${barsHtml}
      </div>
    </div>
  `;
}

/**
 * Renders a line chart using SVG polyline.
 * @param {Array} data — Array of { label, value, color } (color is optional per point)
 * @param {Object} options
 * @param {number}  options.height     — Chart height in px (default: 200)
 * @param {number}  options.width      — Chart width in px (default: auto/100%)
 * @param {boolean} options.showLabels — Show bottom labels
 * @param {boolean} options.showValues — Show value labels at data points
 * @param {boolean} options.showDots   — Show dots at data points (default: true)
 * @param {boolean} options.showGrid   — Show horizontal grid lines (default: true)
 * @param {number}  options.maxValue   — Max value for Y scale
 * @param {string}  options.lineColor  — Line stroke color (default: primary green)
 * @param {string}  options.fillColor  — Area fill color (default: transparent green)
 * @param {string}  options.title      — Chart title
 * @param {string}  options.className  — Additional CSS classes
 * @param {string}  options.id         — Element id
 * @returns {string} HTML string
 */
export function renderLineChart(data = [], options = {}) {
  const {
    height = 200,
    width = 0,
    showLabels = true,
    showValues = false,
    showDots = true,
    showGrid = true,
    maxValue = 0,
    lineColor = '#1B6B3C',
    fillColor = 'rgba(27, 107, 60, 0.1)',
    title = '',
    className = '',
    id = ''
  } = options;

  if (data.length === 0) {
    return `<div class="chart chart--empty ${className}">
              <p class="chart__empty-text">Koi data nahi hai</p>
            </div>`;
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 20 };
  const computedMax = maxValue > 0
    ? maxValue
    : Math.max(...data.map(d => d.value), 1);

  // SVG dimensions
  const svgWidth = width || 300; // Will be scaled to 100% via viewBox
  const svgHeight = height;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Calculate data points
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const points = data.map((item, i) => {
    const x = padding.left + (i * step);
    const y = padding.top + chartHeight - (item.value / computedMax) * chartHeight;
    return { x, y, ...item };
  });

  // Polyline points string
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Area fill polygon (closed shape under the line)
  const areaPoints = [
    `${points[0].x},${padding.top + chartHeight}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padding.top + chartHeight}`
  ].join(' ');

  // Grid lines
  let gridHtml = '';
  if (showGrid) {
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartHeight / gridCount) * i;
      const gridVal = Math.round(computedMax - (computedMax / gridCount) * i);
      gridHtml += `
        <line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}"
              stroke="#E0E0E0" stroke-width="1" stroke-dasharray="4 4" />
        <text x="${padding.left - 4}" y="${y + 4}" text-anchor="end"
              font-size="10" fill="#999" font-family="'Inter', sans-serif">${gridVal}</text>
      `;
    }
  }

  // Dots at data points
  const dotsHtml = showDots
    ? points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4"
                fill="${lineColor}" stroke="#fff" stroke-width="2" />
      `).join('')
    : '';

  // Value labels at data points
  const valuesHtml = showValues
    ? points.map(p => `
        <text x="${p.x}" y="${p.y - 10}" text-anchor="middle"
              font-size="11" font-weight="700" fill="#1A1A1A"
              font-family="'Inter', sans-serif">${p.value}</text>
      `).join('')
    : '';

  // Bottom labels
  const labelsHtml = showLabels
    ? points.map(p => `
        <text x="${p.x}" y="${svgHeight - 8}" text-anchor="middle"
              font-size="10" fill="#666"
              font-family="'Inter', sans-serif">${p.label || ''}</text>
      `).join('')
    : '';

  const idAttr = id ? `id="${id}"` : '';
  const titleHtml = title
    ? `<h4 class="line-chart__title">${title}</h4>`
    : '';

  return `
    <div class="line-chart ${className}" ${idAttr}>
      ${titleHtml}
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}"
           preserveAspectRatio="xMidYMid meet"
           class="line-chart__svg"
           width="100%"
           height="${svgHeight}">
        <!-- Grid -->
        ${gridHtml}

        <!-- Area fill -->
        <polygon points="${areaPoints}" fill="${fillColor}" />

        <!-- Line -->
        <polyline points="${polylinePoints}"
                  fill="none"
                  stroke="${lineColor}"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="line-chart__line" />

        <!-- Dots -->
        ${dotsHtml}

        <!-- Values -->
        ${valuesHtml}

        <!-- Labels -->
        ${labelsHtml}
      </svg>
    </div>
  `;
}

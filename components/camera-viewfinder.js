/**
 * camera-viewfinder.js — QR Scan Camera Viewfinder Overlay
 * Renders the scan overlay with corner brackets and dark surrounding mask.
 * 
 * @module components/camera-viewfinder
 */

/**
 * Renders the camera viewfinder overlay for QR scanning.
 * @param {Object} options
 * @param {string}  options.cornerColor — Corner bracket color (default: primary green)
 * @param {boolean} options.showGrid    — Show crosshair grid lines
 * @param {string}  options.message     — Instruction text below viewfinder
 * @param {string}  options.scanLineColor — Animated scan line color
 * @param {string}  options.id         — Element id
 * @returns {string} HTML string
 */
export function renderCameraViewfinder(options = {}) {
  const {
    cornerColor = '#1B6B3C',
    showGrid = false,
    message = 'QR code ko frame mein rakhein',
    scanLineColor = '#1B6B3C',
    id = ''
  } = options;

  const idAttr = id ? `id="${id}"` : '';

  // Crosshair grid lines (optional)
  const gridHtml = showGrid
    ? `<div class="viewfinder__grid">
        <div class="viewfinder__grid-line viewfinder__grid-line--h"></div>
        <div class="viewfinder__grid-line viewfinder__grid-line--v"></div>
       </div>`
    : '';

  return `
    <div class="viewfinder" ${idAttr}>
      <!-- Semi-transparent overlay mask -->
      <div class="viewfinder__mask">
        <div class="viewfinder__mask-top"></div>
        <div class="viewfinder__mask-middle">
          <div class="viewfinder__mask-left"></div>

          <!-- Clear cutout with corner brackets -->
          <div class="viewfinder__cutout">
            <!-- Top-left corner -->
            <div class="viewfinder__corner viewfinder__corner--tl"
                 style="border-color: ${cornerColor};"></div>
            <!-- Top-right corner -->
            <div class="viewfinder__corner viewfinder__corner--tr"
                 style="border-color: ${cornerColor};"></div>
            <!-- Bottom-left corner -->
            <div class="viewfinder__corner viewfinder__corner--bl"
                 style="border-color: ${cornerColor};"></div>
            <!-- Bottom-right corner -->
            <div class="viewfinder__corner viewfinder__corner--br"
                 style="border-color: ${cornerColor};"></div>

            <!-- Animated scan line -->
            <div class="viewfinder__scan-line"
                 style="background: linear-gradient(90deg, transparent, ${scanLineColor}, transparent);"></div>

            ${gridHtml}
          </div>

          <div class="viewfinder__mask-right"></div>
        </div>
        <div class="viewfinder__mask-bottom"></div>
      </div>

      <!-- Instruction text -->
      ${message
        ? `<div class="viewfinder__message">
            <p class="viewfinder__message-text">${message}</p>
           </div>`
        : ''
      }
    </div>
  `;
}

/**
 * Renders the camera controls bar (torch, flip, close).
 * @param {Object} options
 * @param {string} options.onTorch — Inline JS for torch toggle
 * @param {string} options.onFlip  — Inline JS for camera flip
 * @param {string} options.onClose — Inline JS for close/back
 * @param {boolean} options.torchOn — Current torch state
 * @returns {string} HTML string
 */
export function renderCameraControls(options = {}) {
  const {
    onTorch = '',
    onFlip = '',
    onClose = "window.history.back()",
    torchOn = false
  } = options;

  return `
    <div class="camera-controls">
      <!-- Close button -->
      <button class="camera-controls__btn" onclick="${onClose}" aria-label="Close camera">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Torch toggle -->
      ${onTorch
        ? `<button class="camera-controls__btn ${torchOn ? 'camera-controls__btn--active' : ''}"
                   onclick="${onTorch}" aria-label="Toggle flash">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="${torchOn ? '#F9A825' : 'none'}" stroke="${torchOn ? '#F9A825' : '#fff'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
           </button>`
        : ''
      }

      <!-- Flip camera -->
      ${onFlip
        ? `<button class="camera-controls__btn" onclick="${onFlip}" aria-label="Flip camera">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
            </svg>
           </button>`
        : ''
      }
    </div>
  `;
}

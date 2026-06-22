/**
 * modal.js — Modal Dialog Component
 * Creates and manages Neo-Brutalist modal overlays.
 * Uses direct DOM manipulation (appends to #modal-container).
 * 
 * @module components/modal
 */

/**
 * Shows a modal dialog.
 * @param {Object} options
 * @param {string}  options.title       — Modal title (Hindi/English)
 * @param {string}  options.content     — Modal body HTML content
 * @param {string}  options.confirmText — Confirm button text (default: "Haan")
 * @param {string}  options.cancelText  — Cancel button text (default: "Nahi")
 * @param {Function} options.onConfirm  — Confirm callback
 * @param {Function} options.onCancel   — Cancel callback
 * @param {'default'|'danger'|'success'|'info'} options.variant — Modal style variant
 * @param {boolean} options.showCancel  — Show cancel button (default: true)
 * @param {string}  options.icon        — Optional header icon SVG
 * @param {boolean} options.closeOnOverlay — Close on overlay click (default: true)
 */
export function showModal(options = {}) {
  const {
    title = '',
    content = '',
    confirmText = 'Haan',
    cancelText = 'Nahi',
    onConfirm = null,
    onCancel = null,
    variant = 'default',
    showCancel = true,
    icon = '',
    closeOnOverlay = true
  } = options;

  // Remove any existing modal
  hideModal();

  // Variant-specific confirm button class
  const confirmBtnClass = {
    default: 'btn--primary',
    danger: 'btn--danger',
    success: 'btn--primary',
    info: 'btn--primary'
  }[variant] || 'btn--primary';

  // Build modal HTML
  const modalHtml = `
    <div class="modal" id="active-modal">
      <div class="modal__overlay" id="modal-overlay"></div>
      <div class="modal__content modal__content--${variant}">
        ${icon
          ? `<div class="modal__icon">${icon}</div>`
          : ''
        }
        ${title
          ? `<h2 class="modal__title">${title}</h2>`
          : ''
        }
        ${content
          ? `<div class="modal__body">${content}</div>`
          : ''
        }
        <div class="modal__actions">
          ${showCancel
            ? `<button class="btn btn--outline modal__btn modal__btn--cancel" id="modal-cancel-btn">
                ${cancelText}
               </button>`
            : ''
          }
          <button class="btn ${confirmBtnClass} modal__btn modal__btn--confirm" id="modal-confirm-btn">
            ${confirmText}
          </button>
        </div>
      </div>
    </div>
  `;

  // Get or create modal container
  let container = document.getElementById('modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-container';
    document.body.appendChild(container);
  }

  container.innerHTML = modalHtml;

  // Prevent body scroll
  document.body.classList.add('body--modal-open');

  // Animate in
  requestAnimationFrame(() => {
    const modal = document.getElementById('active-modal');
    if (modal) modal.classList.add('modal--visible');
  });

  // Bind event listeners
  const confirmBtn = document.getElementById('modal-confirm-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const overlay = document.getElementById('modal-overlay');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      hideModal();
      if (onConfirm) onConfirm();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      hideModal();
      if (onCancel) onCancel();
    });
  }

  if (overlay && closeOnOverlay) {
    overlay.addEventListener('click', () => {
      hideModal();
      if (onCancel) onCancel();
    });
  }

  // Trap focus & handle Escape key
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      hideModal();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);
}

/**
 * Hides and removes the active modal.
 */
export function hideModal() {
  const modal = document.getElementById('active-modal');
  if (modal) {
    modal.classList.remove('modal--visible');
    modal.classList.add('modal--hiding');

    // Remove after animation
    setTimeout(() => {
      const container = document.getElementById('modal-container');
      if (container) container.innerHTML = '';
      document.body.classList.remove('body--modal-open');
    }, 200);
  }
}

/**
 * Convenience: show a confirmation modal.
 * @param {string} message — Confirmation message
 * @param {Function} onConfirm — Called on confirm
 * @param {Function} onCancel  — Called on cancel
 */
export function showConfirm(message, onConfirm, onCancel) {
  showModal({
    title: 'Kya aap sure hain?',
    content: `<p>${message}</p>`,
    confirmText: 'Haan, Pakka',
    cancelText: 'Nahi',
    variant: 'default',
    onConfirm,
    onCancel
  });
}

/**
 * Convenience: show a danger confirmation modal.
 * @param {string} message — Warning message
 * @param {Function} onConfirm — Called on confirm
 */
export function showDangerConfirm(message, onConfirm) {
  showModal({
    title: '⚠️ Khabardar!',
    content: `<p>${message}</p>`,
    confirmText: 'Haan, Delete Karo',
    cancelText: 'Rehne Do',
    variant: 'danger',
    onConfirm
  });
}

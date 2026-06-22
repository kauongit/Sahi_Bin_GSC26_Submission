/**
 * form-input.js — Form Input Components
 * Renders complete form groups with label, input, and validation.
 * 
 * @module components/form-input
 */

/**
 * Renders a complete form group (label + input + error).
 * @param {Object} options
 * @param {string}  options.id               — Input element id & name
 * @param {string}  options.label            — Label text
 * @param {'text'|'email'|'password'|'tel'|'textarea'|'select'|'number'|'date'} options.type — Input type
 * @param {string}  options.placeholder      — Placeholder text
 * @param {string}  options.value            — Current value
 * @param {string}  options.error            — Error message (shown in red)
 * @param {boolean} options.required         — Required field
 * @param {Array}   options.options          — Options for select: [{ value, label, selected }]
 * @param {boolean} options.showPasswordToggle — Show eye icon for password fields
 * @param {string}  options.helpText         — Helper text below input
 * @param {string}  options.className        — Additional CSS classes
 * @param {string}  options.icon             — Leading icon SVG
 * @param {number}  options.maxLength        — Max length attribute
 * @param {number}  options.rows             — Rows for textarea (default: 4)
 * @param {string}  options.pattern          — Input pattern attribute
 * @param {string}  options.autocomplete     — Autocomplete attribute
 * @param {boolean} options.disabled         — Disabled state
 * @param {string}  options.onChange         — Inline JS for change handler
 * @returns {string} HTML string
 */
export function renderFormGroup(options = {}) {
  const {
    id = '',
    label = '',
    type = 'text',
    placeholder = '',
    value = '',
    error = '',
    required = false,
    options: selectOptions = [],
    showPasswordToggle = false,
    helpText = '',
    className = '',
    icon = '',
    maxLength = 0,
    rows = 4,
    pattern = '',
    autocomplete = '',
    disabled = false,
    onChange = ''
  } = options;

  const errorClass = error ? 'form-group--error' : '';
  const requiredAttr = required ? 'required' : '';
  const requiredMark = required ? '<span class="form-group__required">*</span>' : '';
  const disabledAttr = disabled ? 'disabled' : '';
  const maxLenAttr = maxLength > 0 ? `maxlength="${maxLength}"` : '';
  const patternAttr = pattern ? `pattern="${pattern}"` : '';
  const autoAttr = autocomplete ? `autocomplete="${autocomplete}"` : '';
  const changeAttr = onChange ? `onchange="${onChange}"` : '';
  const escapedValue = escapeHtml(value);

  // Label HTML
  const labelHtml = label
    ? `<label class="form-group__label" for="${id}">${label}${requiredMark}</label>`
    : '';

  // Error HTML
  const errorHtml = error
    ? `<span class="form-group__error" role="alert">${error}</span>`
    : '';

  // Help text HTML
  const helpHtml = helpText
    ? `<span class="form-group__help">${helpText}</span>`
    : '';

  // Icon prefix
  const iconHtml = icon
    ? `<span class="form-group__icon">${icon}</span>`
    : '';
  const hasIconClass = icon ? 'form-group__input-wrapper--has-icon' : '';

  let inputHtml = '';

  switch (type) {
    case 'textarea':
      inputHtml = `
        <div class="form-group__input-wrapper ${hasIconClass}">
          ${iconHtml}
          <textarea id="${id}"
                    name="${id}"
                    class="form-group__textarea"
                    placeholder="${placeholder}"
                    rows="${rows}"
                    ${requiredAttr}
                    ${disabledAttr}
                    ${maxLenAttr}
                    ${changeAttr}>${escapedValue}</textarea>
        </div>
      `;
      break;

    case 'select':
      const optionsHtml = selectOptions.map(opt => {
        const selected = opt.selected || opt.value === value ? 'selected' : '';
        return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
      }).join('');

      inputHtml = `
        <div class="form-group__input-wrapper ${hasIconClass}">
          ${iconHtml}
          <select id="${id}"
                  name="${id}"
                  class="form-group__select"
                  ${requiredAttr}
                  ${disabledAttr}
                  ${changeAttr}>
            ${placeholder ? `<option value="" disabled ${!value ? 'selected' : ''}>${placeholder}</option>` : ''}
            ${optionsHtml}
          </select>
          <span class="form-group__select-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>
      `;
      break;

    case 'password':
      const toggleBtn = showPasswordToggle
        ? `<button type="button"
                   class="form-group__toggle-btn"
                   onclick="togglePasswordVisibility('${id}')"
                   aria-label="Toggle password visibility">
            <svg id="${id}-eye-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg id="${id}-eye-closed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
           </button>`
        : '';

      inputHtml = `
        <div class="form-group__input-wrapper form-group__input-wrapper--password ${hasIconClass}">
          ${iconHtml}
          <input type="password"
                 id="${id}"
                 name="${id}"
                 class="form-group__input"
                 placeholder="${placeholder}"
                 value="${escapedValue}"
                 ${requiredAttr}
                 ${disabledAttr}
                 ${autoAttr}
                 ${changeAttr} />
          ${toggleBtn}
        </div>
      `;
      break;

    default:
      inputHtml = `
        <div class="form-group__input-wrapper ${hasIconClass}">
          ${iconHtml}
          <input type="${type}"
                 id="${id}"
                 name="${id}"
                 class="form-group__input"
                 placeholder="${placeholder}"
                 value="${escapedValue}"
                 ${requiredAttr}
                 ${disabledAttr}
                 ${maxLenAttr}
                 ${patternAttr}
                 ${autoAttr}
                 ${changeAttr} />
        </div>
      `;
      break;
  }

  return `
    <div class="form-group ${errorClass} ${className}">
      ${labelHtml}
      ${inputHtml}
      ${errorHtml}
      ${helpHtml}
    </div>
  `;
}

/**
 * Global helper — toggles password visibility.
 * Attach to window in the app entry point.
 */
export function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const eyeOpen = document.getElementById(`${inputId}-eye-open`);
  const eyeClosed = document.getElementById(`${inputId}-eye-closed`);

  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (eyeOpen) eyeOpen.style.display = 'none';
    if (eyeClosed) eyeClosed.style.display = 'block';
  } else {
    input.type = 'password';
    if (eyeOpen) eyeOpen.style.display = 'block';
    if (eyeClosed) eyeClosed.style.display = 'none';
  }
}

/**
 * Escape HTML entities to prevent XSS in attribute values.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

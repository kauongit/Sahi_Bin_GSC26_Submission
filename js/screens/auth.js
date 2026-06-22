/**
 * Sahi Bin - Authentication Screens Module
 * Consolidates all authentication flow screens: Role Selection, Login, Registration, OTP, and Forgot Password.
 */

import { router } from '../router.js';
import { store } from '../state.js';
import { showToast } from '../utils.js';
import { loginWithEmail, registerCitizen, resetPassword } from '../firebase/auth-service.js';
import { getAreas } from '../firebase/db-service.js';
import { renderButton } from '../../components/button.js';
import { renderFormGroup } from '../../components/form-input.js';

// ============================================================================
// 1. ROLE SELECTION SCREEN
// ============================================================================

export function renderRoleSelect(container) {
  container.innerHTML = `
    <div class="screen role-select-page" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 24px;">
      <!-- Title Section -->
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 class="text-heading-xl" style="color: var(--color-primary); font-size: 2.5rem; margin-bottom: 8px;">सही बिन</h1>
        <p class="text-label" style="text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-secondary);">Smart Waste Segregation</p>
      </div>

      <h2 class="text-heading-lg" style="margin-bottom: 24px; text-align: center;">AAP KAUN HAIN?</h2>
      
      <!-- Role Cards Container -->
      <div style="width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Citizen Card -->
        <div id="role-citizen" class="card-brutalist card-brutalist--elevated role-card role-card--citizen" style="cursor: pointer; background-color: var(--color-primary); color: white; display: flex; align-items: center; padding: 20px; gap: 16px;">
          <div class="role-icon" style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style="flex-grow: 1;">
            <div class="text-heading-md" style="margin: 0;">NIVASI (Citizen)</div>
            <div class="text-body-sm" style="opacity: 0.9;">Ghar ka kachra report karein aur rewards kamaein</div>
          </div>
        </div>

        <!-- Worker Card -->
        <div id="role-worker" class="card-brutalist card-brutalist--elevated role-card role-card--worker" style="cursor: pointer; background-color: var(--color-accent); color: white; display: flex; align-items: center; padding: 20px; gap: 16px;">
          <div class="role-icon" style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </div>
          <div style="flex-grow: 1;">
            <div class="text-heading-md" style="margin: 0;">SAFAI MITRA (Worker)</div>
            <div class="text-body-sm" style="opacity: 0.9;">Ghar-ghar kachra collect karein aur verify karein</div>
          </div>
        </div>
      </div>

      <!-- Help bar -->
      <div style="margin-top: 48px; font-size: 0.875rem; color: var(--color-text-secondary); text-align: center;">
        Swell and Swachh Bharat Mission support helpline: <a href="tel:1967" style="font-weight: bold; text-decoration: underline; color: var(--color-text);">1967</a>
      </div>
    </div>
  `;

  // Attach Listeners
  document.getElementById('role-citizen').addEventListener('click', () => {
    router.navigate('#/login/citizen');
  });

  document.getElementById('role-worker').addEventListener('click', () => {
    router.navigate('#/login/worker');
  });
}

// ============================================================================
// 2. LOGIN SCREEN
// ============================================================================

export function renderLogin(container, params) {
  const role = params.role || 'citizen';
  const roleLabel = role === 'worker' ? 'SAFAI MITRA' : 'NIVASI';
  const headerColor = role === 'worker' ? 'var(--color-accent)' : 'var(--color-primary)';
  
  container.innerHTML = `
    <div class="screen login-form" style="padding: 24px; display: flex; flex-direction: column; justify-content: center; min-height: 100vh;">
      
      <!-- Back arrow -->
      <div style="margin-bottom: 24px;">
        <button id="back-btn" class="back-button" style="display: flex; align-items: center; gap: 8px; font-weight: bold; border: none; background: none; font-size: 1rem; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Peeche</span>
        </button>
      </div>

      <div style="margin-bottom: 32px;">
        <h2 class="text-heading-lg" style="color: ${headerColor}; font-size: 2rem; margin-bottom: 8px;">LOGIN: ${roleLabel}</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary);">Apne account mein login karne ke liye details daalein.</p>
      </div>

      <form id="login-form-el" class="card-brutalist" style="padding: 24px; background: white;">
        ${renderFormGroup({
          id: 'login-email',
          label: 'EMAIL ID',
          type: 'email',
          placeholder: 'naam@example.com',
          required: true
        })}

        ${renderFormGroup({
          id: 'login-password',
          label: 'PASSWORD',
          type: 'password',
          placeholder: '••••••••',
          required: true
        })}

        <div style="text-align: right; margin-bottom: 24px;">
          <a href="#/forgot-password" class="text-label" style="text-decoration: underline; color: var(--color-text-secondary); font-size: 0.875rem;">Password bhool gaye?</a>
        </div>

        ${renderButton('Aage Badhein', {
          variant: role === 'worker' ? 'secondary' : 'primary',
          block: true,
          type: 'submit',
          id: 'login-submit'
        })}
      </form>

      ${role === 'citizen' ? `
        <div style="text-align: center; margin-top: 24px;">
          <span style="color: var(--color-text-secondary);">Naya account banana hai?</span>
          <a href="#/register" style="font-weight: bold; text-decoration: underline; color: var(--color-primary); margin-left: 4px;">Register karein</a>
        </div>
      ` : ''}
    </div>
  `;

  // Attach Event Listeners
  document.getElementById('back-btn').addEventListener('click', () => {
    router.navigate('#/');
  });

  const form = document.getElementById('login-form-el');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const submitBtn = document.getElementById('login-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'CHECK KAR RAHA HAI...';
    
    try {
      const user = await loginWithEmail(email, password);
      // Ensure the logged in user matches the login role route
      if (user.role !== role) {
        throw new Error(`Aap is email se ${roleLabel} login nahi kar sakte.`);
      }
      
      store.set('currentUser', user);
      showToast('Login Safal Hua!', 'success');
      
      if (role === 'worker') {
        router.navigate('#/worker/dashboard');
      } else {
        router.navigate('#/citizen/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login fail ho gaya', 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = 'AAGE BADHEIN';
    }
  });
}

// ============================================================================
// 3. REGISTRATION SCREEN (Citizen Only)
// ============================================================================

export async function renderRegister(container) {
  // Show skeleton/loading state for areas
  container.innerHTML = `<div class="screen" style="padding:24px; text-align:center;"><p>Sabhi Zones fetch ho rahe hain...</p></div>`;
  
  let areas = [];
  try {
    areas = await getAreas();
  } catch (err) {
    console.error('Failed to fetch areas:', err);
    areas = [{ id: 'area_001', name: 'Gandhi Nagar' }, { id: 'area_002', name: 'Shastri Nagar' }];
  }

  const areaOptions = areas.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

  container.innerHTML = `
    <div class="screen login-form" style="padding: 24px; display: flex; flex-direction: column; justify-content: center; min-height: 100vh;">
      
      <div style="margin-bottom: 24px;">
        <button id="back-btn" class="back-button" style="display: flex; align-items: center; gap: 8px; font-weight: bold; border: none; background: none; font-size: 1rem; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Peeche</span>
        </button>
      </div>

      <div style="margin-bottom: 32px;">
        <h2 class="text-heading-lg" style="color: var(--color-primary); font-size: 2rem; margin-bottom: 8px;">REGISTRATION</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary);">Resident account banane ke liye details dalein.</p>
      </div>

      <form id="register-form-el" class="card-brutalist" style="padding: 24px; background: white; margin-bottom: 40px;">
        ${renderFormGroup({
          id: 'reg-name',
          label: 'PURA NAAM (Name)',
          type: 'text',
          placeholder: 'Ramesh Kumar',
          required: true
        })}

        ${renderFormGroup({
          id: 'reg-phone',
          label: 'PHONE NUMBER',
          type: 'tel',
          placeholder: '9876543210',
          required: true
        })}

        ${renderFormGroup({
          id: 'reg-email',
          label: 'EMAIL ID',
          type: 'email',
          placeholder: 'name@example.com',
          required: true
        })}

        ${renderFormGroup({
          id: 'reg-area',
          label: 'AAPKA ZONE (Area)',
          type: 'select',
          required: true,
          options: `<option value="">Zone select karein</option>${areaOptions}`
        })}

        ${renderFormGroup({
          id: 'reg-address',
          label: 'GHAR KA PATA (Address)',
          type: 'text',
          placeholder: 'House No., Block, Colony Name',
          required: true
        })}

        ${renderFormGroup({
          id: 'reg-password',
          label: 'PASSWORD CREATE KAREIN',
          type: 'password',
          placeholder: '•••••••• (Min 6 characters)',
          required: true
        })}

        ${renderButton('Register Karein', {
          variant: 'primary',
          block: true,
          type: 'submit',
          id: 'reg-submit'
        })}
      </form>
    </div>
  `;

  // Listeners
  document.getElementById('back-btn').addEventListener('click', () => {
    router.navigate('#/login/citizen');
  });

  const form = document.getElementById('register-form-el');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const email = document.getElementById('reg-email').value;
    const areaId = document.getElementById('reg-area').value;
    const address = document.getElementById('reg-address').value;
    const password = document.getElementById('reg-password').value;

    if (password.length < 6) {
      showToast('Password kam se kam 6 letter ka hona chahiye.', 'error');
      return;
    }

    const submitBtn = document.getElementById('reg-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'SAVING ACCOUNT...';

    try {
      const user = await registerCitizen({
        name,
        phone: '+91 ' + phone,
        email,
        areaId,
        address,
        password,
        role: 'citizen'
      });
      store.set('currentUser', user);
      showToast('Registration Safal! OTP verify karein.', 'success');
      router.navigate('#/otp');
    } catch (err) {
      showToast(err.message || 'Registration fail ho gaya', 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = 'REGISTER KAREIN';
    }
  });
}

// ============================================================================
// 4. OTP VERIFICATION SCREEN
// ============================================================================

export function renderOTP(container) {
  const user = store.get('currentUser') || { phone: '+91 XXXXX XXXXX' };
  
  container.innerHTML = `
    <div class="screen login-form" style="padding: 24px; display: flex; flex-direction: column; justify-content: center; min-height: 100vh;">
      <div style="margin-bottom: 32px; text-align: center;">
        <h2 class="text-heading-lg" style="color: var(--color-primary); font-size: 2rem; margin-bottom: 8px;">VERIFY PHONE</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary);">Humne aapke number <strong>${user.phone}</strong> par OTP bheja hai.</p>
      </div>

      <div class="card-brutalist" style="padding: 24px; background: white; text-align: center;">
        <label class="form-label" style="margin-bottom: 16px;">6-DIGIT OTP DALEIN</label>
        
        <!-- OTP input group -->
        <div class="otp-input-group" style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
          <input type="text" maxlength="1" class="form-input otp-box" style="width: 44px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: bold; border: var(--border-brutalist); border-radius: var(--radius-sm);" autofocus>
          <input type="text" maxlength="1" class="form-input otp-box" style="width: 44px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: bold; border: var(--border-brutalist); border-radius: var(--radius-sm);">
          <input type="text" maxlength="1" class="form-input otp-box" style="width: 44px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: bold; border: var(--border-brutalist); border-radius: var(--radius-sm);">
          <input type="text" maxlength="1" class="form-input otp-box" style="width: 44px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: bold; border: var(--border-brutalist); border-radius: var(--radius-sm);">
          <input type="text" maxlength="1" class="form-input otp-box" style="width: 44px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: bold; border: var(--border-brutalist); border-radius: var(--radius-sm);">
          <input type="text" maxlength="1" class="form-input otp-box" style="width: 44px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: bold; border: var(--border-brutalist); border-radius: var(--radius-sm);">
        </div>

        ${renderButton('Verify & Complete', {
          variant: 'primary',
          block: true,
          id: 'otp-submit'
        })}

        <div style="margin-top: 16px;">
          <button id="resend-otp-btn" style="background: none; border: none; text-decoration: underline; color: var(--color-text-secondary); cursor: pointer; font-size: 0.875rem;">Resend OTP (30s)</button>
        </div>
      </div>
    </div>
  `;

  // Autotab logic
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, idx) => {
    box.addEventListener('input', (e) => {
      if (box.value && idx < boxes.length - 1) {
        boxes[idx + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && idx > 0) {
        boxes[idx - 1].focus();
      }
    });
  });

  // Verify OTP
  document.getElementById('otp-submit').addEventListener('click', async () => {
    let otp = '';
    boxes.forEach(box => { otp += box.value; });

    if (otp.length < 6) {
      showToast('Pura 6-digit OTP dalein.', 'warning');
      return;
    }

    const submitBtn = document.getElementById('otp-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'VERIFYING...';

    // Mock verification for OTP
    setTimeout(() => {
      if (otp === '123456' || otp === '000000') {
        showToast('Mobile verified!', 'success');
        // Enforce verified status
        const current = store.get('currentUser');
        store.set('currentUser', { ...current, mobileVerified: true });
        
        if (current.role === 'worker') {
          router.navigate('#/worker/dashboard');
        } else {
          router.navigate('#/citizen/dashboard');
        }
      } else {
        showToast('Galat OTP. 123456 enter karein.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = 'VERIFY & COMPLETE';
      }
    }, 1000);
  });
}

// ============================================================================
// 5. FORGOT PASSWORD SCREEN
// ============================================================================

export function renderForgotPassword(container) {
  container.innerHTML = `
    <div class="screen login-form" style="padding: 24px; display: flex; flex-direction: column; justify-content: center; min-height: 100vh;">
      <div style="margin-bottom: 24px;">
        <button id="back-btn" class="back-button" style="display: flex; align-items: center; gap: 8px; font-weight: bold; border: none; background: none; font-size: 1rem; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Peeche</span>
        </button>
      </div>

      <div style="margin-bottom: 32px;">
        <h2 class="text-heading-lg" style="color: var(--color-primary); font-size: 2rem; margin-bottom: 8px;">PASSWORD RESET</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary);">Apne account ki email id daalein. Hum password reset link bhejenge.</p>
      </div>

      <form id="forgot-form-el" class="card-brutalist" style="padding: 24px; background: white;">
        ${renderFormGroup({
          id: 'forgot-email',
          label: 'REGISTERED EMAIL ID',
          type: 'email',
          placeholder: 'naam@example.com',
          required: true
        })}

        ${renderButton('Reset Link Bhejien', {
          variant: 'primary',
          block: true,
          type: 'submit',
          id: 'forgot-submit'
        })}
      </form>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    window.history.back();
  });

  const form = document.getElementById('forgot-form-el');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const submitBtn = document.getElementById('forgot-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'LINK BHEJ RAHA HAI...';

    try {
      await resetPassword(email);
      showToast('Password reset link email par bhej diya gaya hai.', 'success');
      setTimeout(() => {
        router.navigate('#/');
      }, 2000);
    } catch (err) {
      showToast(err.message || 'Link bhejne mein error aaya', 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = 'RESET LINK BHEJIEN';
    }
  });
}

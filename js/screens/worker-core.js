/**
 * Sahi Bin - Worker Core Collection Screens Module
 * Consolidates Dashboard, Route, House Queue, Scan, Details, Capture, AI Processing, Result, and Success.
 */

import { router } from '../router.js';
import { store } from '../state.js';
import { showToast, formatDate, getGreeting } from '../utils.js';
import { renderHeader } from '../../components/header.js';
import { renderBottomNav, WORKER_HOME_TABS } from '../../components/bottom-nav.js';
import { renderButton } from '../../components/button.js';
import { renderStatTile } from '../../components/stat-tile.js';
import { renderProgressBar } from '../../components/progress-bar.js';
import { getVerificationResult } from '../verification/gps-verifier.js';
import { ClassificationEngine } from '../classification/engine.js';
import { enqueue } from '../offline/offline-queue.js';
import { createWasteLog, getDocument, getTodaySchedule } from '../firebase/db-service.js';

// Helper to check and get current worker session state
function getSession() {
  if (!store.get('currentSession')) {
    store.set('currentSession', {
      householdId: null,
      householdAddress: null,
      citizenName: null,
      citizenPhone: null,
      capturedImageBlob: null,
      capturedImageUrl: null,
      wasteType: null,
      segregationOk: null,
      classificationResult: null,
      verificationMethod: 'qr',
      gpsVerified: false,
      timestamp: null
    });
  }
  return store.get('currentSession');
}

// ============================================================================
// 1. WORKER DASHBOARD
// ============================================================================

export async function renderWorkerDashboard(container) {
  const user = store.get('currentUser') || { name: 'Worker' };
  
  // Loading state
  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING DASHBOARD...</p>
    </div>
  `;
  
  // Fetch today's schedule and stats
  let totalStops = 45;
  let completedStops = 12;
  let geelaKg = 34.2;
  let sookhaKg = 18.5;
  let mixedKg = 4.3;
  let nextStopAddress = 'House #42, Gandhi Nagar, Sector 4';
  let nextStopId = 'hh_001';

  try {
    const schedules = await getTodaySchedule(user.uid || 'worker_001');
    if (schedules.length > 0) {
      totalStops = schedules.length;
      // Filter out completed ones using local state or query
      const completed = store.get('completedStopsList') || [];
      completedStops = completed.length;
      const nextIndex = completedStops < totalStops ? completedStops : totalStops - 1;
      nextStopAddress = schedules[nextIndex]?.address || nextStopAddress;
      nextStopId = schedules[nextIndex]?.householdId || nextStopId;
    }
  } catch (err) {
    console.warn('Could not load worker daily schedule:', err);
  }

  // Update store stats
  store.set('todayStats', {
    totalHouses: totalStops,
    completedHouses: completedStops,
    geelaKg,
    sookhaKg,
    mixedKg,
    nextStop: nextStopAddress,
    nextStopId
  });

  const percent = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  const headerHtml = renderHeader({
    title: 'SAHI BIN',
    showMenu: true,
    showAvatar: true,
    roleBadge: 'WORKER MODE',
    avatarUrl: user.avatarUrl
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-bottom: 90px; padding-top: 80px;">
      <!-- Greeting and Shift info -->
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 class="text-heading-md" style="font-size: 1.5rem; text-transform: uppercase;">${getGreeting()}, ${user.name.split(' ')[0]}!</h2>
          <p class="text-body-sm" style="color: var(--color-text-secondary);">DUTY STATUS: <span class="status-dot status-dot--active"></span> ON SHIFT</p>
        </div>
      </div>

      <!-- AAJ KA KAAM Card -->
      <div class="card-brutalist" style="background: white; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="text-heading-sm" style="font-style: italic;">AAJ KA KAAM</span>
          <span class="text-label" style="font-size: 1.125rem;">${completedStops}/${totalStops} stops</span>
        </div>
        
        ${renderProgressBar(completedStops, totalStops, { showLabel: true })}
        
        <div style="display: flex; justify-content: space-between; margin-top: 16px;">
          <a href="#/worker/route" class="btn btn-outline btn-block" style="text-align: center; text-transform: uppercase; font-weight: bold; padding: 8px;">View Route 🗺️</a>
        </div>
      </div>

      <!-- Stats row (Geela, Sookha, Mixed) -->
      <h3 class="text-heading-sm" style="margin-bottom: 12px;">COLLECTED WASTE</h3>
      <div class="stat-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        ${renderStatTile({
          icon: '🥬',
          label: 'GEELA',
          value: `${geelaKg.toFixed(1)} KG`,
          variant: 'wet'
        })}
        ${renderStatTile({
          icon: '📦',
          label: 'SOOKHA',
          value: `${sookhaKg.toFixed(1)} KG`,
          variant: 'dry'
        })}
      </div>
      <div class="card-brutalist" style="padding: 12px; background: var(--color-danger-bg); display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <span class="text-label">⚠️ MIXED WASTE COLLECTED:</span>
        <span class="text-heading-sm" style="color: var(--color-danger);">${mixedKg.toFixed(1)} KG</span>
      </div>

      <!-- Next stop panel -->
      <div class="card-brutalist" style="background: white; margin-bottom: 30px;">
        <div style="font-size: 0.75rem; font-weight: bold; color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: 4px;">Next Stop (Agla Ghar)</div>
        <div class="text-label" style="font-size: 1.1rem; margin-bottom: 8px;">${nextStopAddress}</div>
        <a href="#/worker/household/${nextStopId}" style="color: var(--color-accent); text-decoration: underline; font-weight: bold; font-size: 0.875rem;">Ghar ke Details ↗</a>
      </div>

      <!-- SCAN BUTTON -->
      <div style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); width: 100%; max-width: 440px; padding: 0 20px; z-index: 900;">
        <button id="scan-btn" class="btn btn-primary btn-block btn-lg" style="box-shadow: 6px 6px 0 #1a1a1a; display: flex; align-items: center; justify-content: center; gap: 12px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
          <span style="font-size: 1.25rem;">SCAN HOUSE QR</span>
        </button>
      </div>
    </div>

    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  // Attach listener
  document.getElementById('scan-btn').addEventListener('click', () => {
    router.navigate('#/worker/scan');
  });
}

// ============================================================================
// 2. ASSIGNED ROUTE
// ============================================================================

export async function renderAssignedRoute(container) {
  const headerHtml = renderHeader({
    title: 'ROUTING PLAN',
    backButton: true
  });
  
  container.innerHTML = `
    ${headerHtml}
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 20px;">
        <h2 class="text-heading-sm" style="margin-bottom: 8px;">ASSIGNED ROUTE: AREA SECTOR 4</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary); margin-bottom: 12px;">Total stops: 5 households. GPS optimization active.</p>
        <button id="start-queue-btn" class="btn btn-primary btn-block">Start Collecting 🗺️</button>
      </div>

      <h3 class="text-heading-sm" style="margin-bottom: 12px;">ROUTE QUEUE</h3>
      <div id="route-stops-list">
        <!-- List elements -->
        <div class="card-brutalist" style="background: #E8F5E9; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div class="text-label">1. House #42, Gali No. 3</div>
            <div class="text-caption">QR-GN-042 | Status: Completed</div>
          </div>
          <span style="font-size: 1.5rem; color: var(--color-success);">✓</span>
        </div>

        <div class="card-brutalist" style="background: white; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-color: var(--color-accent);">
          <div>
            <div class="text-label">2. House #56, Gali No. 3</div>
            <div class="text-caption">QR-GN-056 | Status: Next Stop</div>
          </div>
          <span class="badge badge--info">NEXT</span>
        </div>

        <div class="card-brutalist" style="background: white; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; opacity: 0.7;">
          <div>
            <div class="text-label">3. House #104, Gali No. 3</div>
            <div class="text-caption">QR-GN-104 | Status: Pending</div>
          </div>
          <span style="font-size: 1.2rem; color: var(--color-text-muted);">🕒</span>
        </div>
      </div>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  document.getElementById('start-queue-btn').addEventListener('click', () => {
    router.navigate('#/worker/queue');
  });
}

// ============================================================================
// 3. HOUSE QUEUE
// ============================================================================

export function renderHouseQueue(container) {
  const headerHtml = renderHeader({
    title: 'QUEUE LIST',
    backButton: true
  });
  
  container.innerHTML = `
    ${headerHtml}
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <div style="margin-bottom: 16px;">
        <h2 class="text-heading-sm">TODAY'S COLLECTION QUEUE</h2>
      </div>

      <div class="house-queue-item card-brutalist" style="background: #C8E6C9; display: flex; justify-content: space-between; align-items: center; padding: 16px; margin-bottom: 12px;">
        <div>
          <span class="text-label">STOP #1 (COMPLETED)</span>
          <p class="text-body" style="font-weight: bold; margin-top: 4px;">House 42, Sector 4</p>
        </div>
        <span style="font-size: 1.8rem; color: #2E7D32;">✓</span>
      </div>

      <div class="house-queue-item card-brutalist" style="background: white; border-color: var(--color-accent); display: flex; justify-content: space-between; align-items: center; padding: 16px; margin-bottom: 12px; cursor: pointer;" onclick="window.location.hash='#/worker/household/hh_001'">
        <div>
          <span class="text-label" style="color: var(--color-accent);">STOP #2 (ACTIVE STOP)</span>
          <p class="text-body" style="font-weight: bold; margin-top: 4px;">House 56, Sector 4</p>
        </div>
        <span style="font-size: 1.5rem;">➡️</span>
      </div>

      <div class="house-queue-item card-brutalist" style="background: white; display: flex; justify-content: space-between; align-items: center; padding: 16px; margin-bottom: 12px; opacity: 0.6;">
        <div>
          <span class="text-label">STOP #3 (PENDING)</span>
          <p class="text-body" style="font-weight: bold; margin-top: 4px;">House 104, Sector 4</p>
        </div>
        <span style="font-size: 1.5rem;">🕒</span>
      </div>

      <div style="margin-top: 24px;">
        <button id="scan-qr-shortcut" class="btn btn-primary btn-block">Quick Scan QR 📷</button>
      </div>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  document.getElementById('scan-qr-shortcut').addEventListener('click', () => {
    router.navigate('#/worker/scan');
  });
}

// ============================================================================
// 4. QR SCAN
// ============================================================================

export function renderQRScan(container) {
  const headerHtml = renderHeader({
    title: 'SCAN QR CODE',
    backButton: true
  });
  
  container.innerHTML = `
    ${headerHtml}
    <div class="screen" style="padding: 0; background: #000; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding-top: 80px; padding-bottom: 80px;">
      
      <!-- Scan overlay message -->
      <div style="background: rgba(0,0,0,0.6); padding: 16px; text-align: center; color: white; z-index: 100;">
        <p class="text-heading-sm" style="color: var(--color-primary-light);">GHAR KA QR CODE SCAN KAREIN</p>
        <p style="font-size: 0.8125rem; opacity: 0.8; margin-top: 4px;">Keep the QR code inside the green brackets</p>
      </div>

      <!-- Viewfinder container -->
      <div style="position: relative; flex-grow: 1; display: flex; align-items: center; justify-content: center;">
        <div class="qr-viewfinder" style="position: relative; width: 260px; height: 260px; border: 1px solid rgba(255,255,255,0.3); z-index: 50;">
          <!-- Corner brackets using borders -->
          <div style="position: absolute; top: -3px; left: -3px; width: 30px; height: 30px; border-top: 6px solid var(--color-success); border-left: 6px solid var(--color-success);"></div>
          <div style="position: absolute; top: -3px; right: -3px; width: 30px; height: 30px; border-top: 6px solid var(--color-success); border-right: 6px solid var(--color-success);"></div>
          <div style="position: absolute; bottom: -3px; left: -3px; width: 30px; height: 30px; border-bottom: 6px solid var(--color-success); border-left: 6px solid var(--color-success);"></div>
          <div style="position: absolute; bottom: -3px; right: -3px; width: 30px; height: 30px; border-bottom: 6px solid var(--color-success); border-right: 6px solid var(--color-success);"></div>
          
          <div style="width: 100%; height: 2px; background: red; position: absolute; top: 50%; transform: translateY(-50%); animation: scanLine 2.5s infinite linear;"></div>
        </div>
      </div>

      <!-- Manual QR Override (for browser testing / fallback) -->
      <div style="background: rgba(0,0,0,0.85); padding: 20px; z-index: 100; color: white; display: flex; flex-direction: column; gap: 12px; border-top: var(--border-brutalist);">
        <label class="form-label" style="color: white; margin: 0;">OR ENTER HOUSEHOLD ID MANUALLY</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="manual-qr-input" class="form-input" style="flex-grow: 1; background: #222; border-color: #555; color: white;" placeholder="e.g. hh_001">
          <button id="manual-qr-submit" class="btn btn-secondary">Submit</button>
        </div>
      </div>
    </div>

    <style>
      @keyframes scanLine {
        0% { top: 0%; }
        50% { top: 100%; }
        100% { top: 0%; }
      }
    </style>
  `;

  // Simulator for browser testing
  document.getElementById('manual-qr-submit').addEventListener('click', () => {
    const hhId = document.getElementById('manual-qr-input').value.trim() || 'hh_001';
    
    // In progress, set session household id
    const session = getSession();
    session.householdId = hhId;
    store.set('currentSession', session);
    
    showToast('QR code scanned successfully!', 'success');
    router.navigate(`#/worker/household/${hhId}`);
  });
}

// ============================================================================
// 5. HOUSEHOLD DETAILS & GPS VERIFICATION
// ============================================================================

export async function renderHouseholdDetails(container, params) {
  const hhId = params.id || 'hh_001';
  
  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING HOUSEHOLD DETAILS...</p>
    </div>
  `;

  let household = null;
  try {
    household = await getDocument('households', hhId);
  } catch (err) {
    console.warn('Failed to load household from database, using mock', err);
  }

  // Fallback to mock if database unavailable or missing
  if (!household) {
    household = {
      id: hhId,
      address: 'House #42, Gandhi Nagar, Sector 4',
      citizenId: 'cit_001',
      areaId: 'area_001',
      qrCodeId: 'QR-GN-042',
      collectionStatus: 'pending',
      lastCollectionDate: new Date(),
      lifetimeWetWasteKg: 42.5,
      lifetimeDryWasteKg: 28.1,
      lifetimeMixedWasteKg: 8.4,
      location: { lat: 28.591, lng: 77.058 } // Mock coordinates for Dwarka Sector 4
    };
  }

  // Update session object
  const session = getSession();
  session.householdId = household.id;
  session.householdAddress = household.address;
  session.citizenId = household.citizenId;
  store.set('currentSession', session);

  const headerHtml = renderHeader({
    title: 'GHAR DETAILS',
    backButton: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      
      <!-- Household Info Card -->
      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 20px;">
        <span class="badge badge--success" style="margin-bottom: 8px;">HOUSEHOLD</span>
        <h2 class="text-heading-sm" style="font-size: 1.25rem;">Address: ${household.address}</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary); margin-top: 4px;">QR ID: ${household.qrCodeId}</p>
      </div>

      <!-- GPS Verification Panel -->
      <div class="card-brutalist" style="background: white; padding: 20px; border-color: var(--color-accent); margin-bottom: 24px;">
        <h3 class="text-heading-sm" style="margin-bottom: 8px; font-style: italic;">GPS LOCATION VERIFICATION</h3>
        <p class="text-body-sm" style="color: var(--color-text-secondary); margin-bottom: 16px;">
          Checking proximity to household coordinates...
        </p>

        <div id="gps-status-box" class="info-bar" style="background: var(--color-bg); justify-content: center; font-weight: bold; margin-bottom: 16px;">
          📡 CHECKING GPS...
        </div>

        <button id="verify-gps-btn" class="btn btn-secondary btn-block">Verify Proximity 📍</button>
        <button id="skip-gps-btn" class="btn btn-outline btn-block" style="margin-top: 8px; border-color: var(--color-border-light); font-size: 0.8125rem;">Fallback to QR / Skip</button>
      </div>

      <!-- Lifetime Stats -->
      <h3 class="text-heading-sm" style="margin-bottom: 12px;">LIFETIME STATS</h3>
      <div class="stat-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div class="card-stat card-stat--wet">
          <span style="font-size: 1.5rem;">🥬</span>
          <div class="text-label" style="font-size: 0.75rem; margin-top: 4px;">WET WASTE</div>
          <div class="text-heading-sm">${household.lifetimeWetWasteKg.toFixed(1)} KG</div>
        </div>
        <div class="card-stat card-stat--dry">
          <span style="font-size: 1.5rem;">📦</span>
          <div class="text-label" style="font-size: 0.75rem; margin-top: 4px;">DRY WASTE</div>
          <div class="text-heading-sm">${household.lifetimeDryWasteKg.toFixed(1)} KG</div>
        </div>
      </div>
      <div class="card-brutalist" style="padding: 12px; background: var(--color-danger-bg); display: flex; justify-content: space-between; align-items: center;">
        <span class="text-label" style="font-size: 0.8125rem;">MIXED WASTE ACCUMULATED:</span>
        <span class="text-heading-sm" style="color: var(--color-danger);">${household.lifetimeMixedWasteKg.toFixed(1)} KG</span>
      </div>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  // Auto trigger GPS proximity check
  const checkGPS = async () => {
    const statusBox = document.getElementById('gps-status-box');
    try {
      const res = await getVerificationResult(household.location);
      if (res.verified) {
        statusBox.innerHTML = `🟢 LOCATION VERIFIED (${res.method.toUpperCase()})`;
        statusBox.style.backgroundColor = 'var(--color-success-bg)';
        statusBox.style.borderColor = 'var(--color-success)';
        
        session.gpsVerified = true;
        session.verificationMethod = res.method;
        store.set('currentSession', session);
        
        showToast('Location verified successfully!', 'success');
        
        // Auto-navigate to Waste Capture after 1s
        setTimeout(() => {
          router.navigate('#/worker/capture');
        }, 1200);
      } else {
        statusBox.innerHTML = `🔴 OUT OF PROXIMITY`;
        statusBox.style.backgroundColor = 'var(--color-danger-bg)';
        statusBox.style.borderColor = 'var(--color-danger)';
        showToast('Aap ghar ke paas nahi hain. Try again or skip.', 'warning');
      }
    } catch (e) {
      statusBox.innerHTML = `⚠️ GPS ERROR`;
      statusBox.style.backgroundColor = 'var(--color-warning-bg)';
      statusBox.style.borderColor = 'var(--color-warning)';
    }
  };

  setTimeout(checkGPS, 600);

  document.getElementById('verify-gps-btn').addEventListener('click', checkGPS);
  
  document.getElementById('skip-gps-btn').addEventListener('click', () => {
    session.gpsVerified = true;
    session.verificationMethod = 'manual'; // Fallback manual override
    store.set('currentSession', session);
    router.navigate('#/worker/capture');
  });
}

// ============================================================================
// 6. WASTE CAPTURE
// ============================================================================

export function renderWasteCapture(container) {
  const headerHtml = renderHeader({
    title: 'CAPTURE PHOTO',
    backButton: true
  });
  
  container.innerHTML = `
    ${headerHtml}
    <div class="screen" style="padding: 0; background: #000; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding-top: 80px; padding-bottom: 80px;">
      
      <!-- Camera viewfinder simulation -->
      <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; position: relative;">
        <!-- Canvas/Camera preview placeholder -->
        <div id="camera-preview" style="width: 100%; height: 100%; background: #1c1c1c; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.4);">
          <span style="font-size: 3rem;">📸</span>
          <p class="text-heading-sm" style="color: white; margin-top: 12px;">CAMERA VIEWFINDER ACTIVE</p>
          <p style="font-size: 0.8125rem; opacity: 0.7;">Align waste bucket inside frame</p>
        </div>
      </div>

      <!-- Action Footer -->
      <div style="background: rgba(0,0,0,0.9); padding: 24px; border-top: var(--border-brutalist); text-align: center; display: flex; flex-direction: column; gap: 16px; align-items: center;">
        <button id="snap-btn" class="btn btn-secondary btn-lg" style="border-radius: 50%; width: 72px; height: 72px; padding: 0; display: flex; align-items: center; justify-content: center; border: var(--border-brutalist); box-shadow: 4px 4px 0 #fff;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </button>
        <span class="text-caption" style="color: white;">KACHRE KA PHOTO KHEENCHEIN</span>
      </div>
    </div>
  `;

  document.getElementById('snap-btn').addEventListener('click', () => {
    // Generate a mock green/wet waste image blob for testing
    // In a real application, you would capture from a video stream
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1B6B3C'; // green color representing wet waste
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('WET WASTE BUCKET (MOCK)', 20, 150);
    
    canvas.toBlob((blob) => {
      const session = getSession();
      session.capturedImageBlob = blob;
      session.capturedImageUrl = URL.createObjectURL(blob);
      store.set('currentSession', session);
      
      showToast('Photo captured!', 'success');
      router.navigate('#/worker/processing');
    }, 'image/jpeg');
  });
}

// ============================================================================
// 7. AI PROCESSING SCREEN
// ============================================================================

export function renderAIProcessing(container) {
  const session = getSession();
  
  container.innerHTML = `
    <div class="screen" style="padding: 0; background: #000; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden;">
      
      <!-- Processing Image Backdrop -->
      <div style="position: relative; width: 280px; height: 280px; border: var(--border-brutalist); border-radius: var(--radius); overflow: hidden; background: #222; margin-bottom: 30px;">
        <img src="${session.capturedImageUrl}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
        
        <!-- Animated scanning overlay -->
        <div class="ai-processing-overlay" style="position: absolute; left: 0; top: 0; width: 100%; height: 4px; background: var(--color-success); box-shadow: 0 0 10px var(--color-success); animation: scanAnimation 2s infinite ease-in-out;"></div>
      </div>

      <h2 class="text-heading-lg" style="color: white; text-align: center; margin-bottom: 8px;">AI CHECK KAR RAHA HAI...</h2>
      <p class="text-body-sm" style="color: var(--color-text-secondary); text-align: center;">Scanning kachra for classification type.</p>
    </div>

    <style>
      @keyframes scanAnimation {
        0% { top: 0%; }
        50% { top: 100%; }
        100% { top: 0%; }
      }
    </style>
  `;

  // Trigger classification
  const classifyWaste = async () => {
    try {
      const engine = ClassificationEngine.getEngine('manual'); // Using manual fallback V1 as default
      const res = await engine.classify(session.capturedImageBlob, {
        wasteType: 'wet', // default mock inputs
        isSegregated: true
      });
      
      session.wasteType = res.wasteType;
      session.segregationOk = res.isSegregated;
      session.classificationResult = res;
      store.set('currentSession', session);
      
      router.navigate('#/worker/result');
    } catch (err) {
      console.error(err);
      showToast('AI classification failed. Using manual fallback.', 'error');
      router.navigate('#/worker/result');
    }
  };

  setTimeout(classifyWaste, 1500);
}

// ============================================================================
// 8. AI RESULT / WASTE RESULT SCREEN
// ============================================================================

export function renderWasteResult(container) {
  const session = getSession();
  
  // Set default values if classification returned nothing
  const wasteType = session.wasteType || 'wet';
  const isSegregated = session.segregationOk ?? true;

  const headerHtml = renderHeader({
    title: 'AI RESULT',
    backButton: true
  });

  const typeLabel = wasteType === 'wet' ? 'GEELA KACHRA (Wet)' : (wasteType === 'dry' ? 'SOOKHA KACHRA (Dry)' : 'MIXED KACHRA (Mixed)');
  const typeBg = wasteType === 'wet' ? 'var(--color-success-bg)' : (wasteType === 'dry' ? 'var(--color-info-bg)' : 'var(--color-danger-bg)');
  const typeColor = wasteType === 'wet' ? '#2E7D32' : (wasteType === 'dry' ? '#1A237E' : 'var(--color-danger)');

  container.innerHTML = `
    ${headerHtml}
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 90px;">
      
      <h2 class="text-heading-lg" style="margin-bottom: 16px; font-style: italic;">AI RESULT</h2>
      
      <!-- Captured Image with Badge -->
      <div style="position: relative; width: 100%; height: 200px; border: var(--border-brutalist); border-radius: var(--radius); overflow: hidden; margin-bottom: 16px;">
        <img src="${session.capturedImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">
        <span class="badge badge--success" style="position: absolute; bottom: 12px; left: 12px;">CAPTURED JUST NOW</span>
      </div>

      <!-- Result Card -->
      <div class="card-brutalist" style="background: ${typeBg}; padding: 20px; border-color: var(--color-border); margin-bottom: 20px; text-align: center;">
        <div class="text-caption" style="color: ${typeColor}; font-weight: bold;">AI CLASSIFICATION</div>
        <h3 class="text-heading-md" style="font-size: 1.6rem; color: ${typeColor}; margin: 8px 0;">${typeLabel}</h3>
        
        <div class="divider" style="background: rgba(0,0,0,0.15);"></div>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; font-weight: bold;">
          <span>SEGREGATION STATUS:</span>
          ${isSegregated 
            ? '<span class="badge badge--success">✓ SAHI HAI</span>' 
            : '<span class="badge badge--danger">✗ GALAT HAI</span>'}
        </div>
      </div>

      <!-- Classification Adjustments (Segregation Toggle) -->
      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 24px;">
        <h4 class="text-label" style="margin-bottom: 12px;">IS THE AI CORRECT? (Kya AI sahi hai?)</h4>
        
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <button id="correct-yes-btn" class="btn btn-outline" style="flex: 1; font-weight: bold; background: ${isSegregated ? '#E8F5E9' : 'transparent'}; border-color: ${isSegregated ? '#2e7d32' : 'var(--color-border)'};">
            ✓ SAHI HAI (Segregated)
          </button>
          <button id="correct-no-btn" class="btn btn-outline" style="flex: 1; font-weight: bold; background: ${!isSegregated ? '#FFCDD2' : 'transparent'}; border-color: ${!isSegregated ? '#D32F2F' : 'var(--color-border)'};">
            ✗ GALAT HAI (Mixed)
          </button>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem;">SELECT ACTUAL TYPE IF WRONG</label>
          <select id="correct-type-select" class="form-input form-select" style="padding: 8px;">
            <option value="wet" ${wasteType === 'wet' ? 'selected' : ''}>Geela Kachra (Wet Waste)</option>
            <option value="dry" ${wasteType === 'dry' ? 'selected' : ''}>Sookha Kachra (Dry Waste)</option>
            <option value="mixed" ${wasteType === 'mixed' ? 'selected' : ''}>Mixed Kachra (Mixed Waste)</option>
          </select>
        </div>
      </div>

      <!-- Weight selector -->
      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
        <label class="text-label">WASTE WEIGHT (Kachre ka vajan)</label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="number" id="weight-input" class="form-input" style="width: 80px; text-align: center;" value="1.5" step="0.1" min="0.1">
          <span class="text-heading-sm">KG</span>
        </div>
      </div>

      <!-- SUBMIT BUTTON -->
      <button id="submit-collection-btn" class="btn btn-primary btn-block btn-lg" style="box-shadow: 6px 6px 0 #1a1a1a;">
        SUBMIT KAREIN (Save)
      </button>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  // Attach correction button events
  const yesBtn = document.getElementById('correct-yes-btn');
  const noBtn = document.getElementById('correct-no-btn');
  const typeSelect = document.getElementById('correct-type-select');

  yesBtn.addEventListener('click', () => {
    session.segregationOk = true;
    store.set('currentSession', session);
    yesBtn.style.background = '#E8F5E9';
    yesBtn.style.borderColor = '#2e7d32';
    noBtn.style.background = 'transparent';
    noBtn.style.borderColor = 'var(--color-border)';
  });

  noBtn.addEventListener('click', () => {
    session.segregationOk = false;
    store.set('currentSession', session);
    noBtn.style.background = '#FFCDD2';
    noBtn.style.borderColor = '#D32F2F';
    yesBtn.style.background = 'transparent';
    yesBtn.style.borderColor = 'var(--color-border)';
  });

  typeSelect.addEventListener('change', (e) => {
    session.wasteType = e.target.value;
    if (e.target.value === 'mixed') {
      session.segregationOk = false;
      noBtn.click();
    }
    store.set('currentSession', session);
  });

  // Submit collection
  document.getElementById('submit-collection-btn').addEventListener('click', async () => {
    const weight = parseFloat(document.getElementById('weight-input').value) || 1.5;
    const worker = store.get('currentUser') || { uid: 'worker_001', name: 'Ramesh Kumar' };
    
    const submitBtn = document.getElementById('submit-collection-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'SAVING DATA...';

    const logData = {
      householdId: session.householdId,
      citizenId: session.citizenId,
      workerId: worker.uid,
      workerName: worker.name,
      wasteType: session.wasteType || 'wet',
      isSegregated: session.segregationOk ?? true,
      weightKg: weight,
      collectionVerified: session.gpsVerified,
      verificationMethod: session.verificationMethod || 'qr'
    };

    if (navigator.onLine) {
      try {
        // Online: save directly to Firestore
        await createWasteLog(logData);
        showToast('Collection saved to server!', 'success');
        
        // Add to completed stops list in state
        const completed = store.get('completedStopsList') || [];
        if (!completed.includes(session.householdId)) {
          completed.push(session.householdId);
          store.set('completedStopsList', completed);
        }
        
        router.navigate('#/worker/success');
      } catch (err) {
        showToast('Firestore failed, saving locally...', 'warning');
        await saveOffline(logData);
      }
    } else {
      // Offline: save to IndexedDB queue
      await saveOffline(logData);
    }
  });

  async function saveOffline(logData) {
    try {
      await enqueue('pending_logs', {
        logData,
        imageBlob: session.capturedImageBlob
      });
      showToast('Offline saved! Connection aate hi sync hoga.', 'success');
      
      // Update queue count in state
      const countVal = store.get('offlineQueueCount') || 0;
      store.set('offlineQueueCount', countVal + 1);

      const completed = store.get('completedStopsList') || [];
      if (!completed.includes(session.householdId)) {
        completed.push(session.householdId);
        store.set('completedStopsList', completed);
      }
      
      router.navigate('#/worker/success');
    } catch (e) {
      console.error(e);
      showToast('Saving failed completely.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = 'SUBMIT KAREIN';
    }
  }
}

// ============================================================================
// 9. COLLECTION SUCCESS SCREEN
// ============================================================================

export function renderCollectionSuccess(container) {
  const session = getSession();
  const points = (session.segregationOk ?? true) ? '+20 POINTS' : '-10 POINTS';
  const pointsColor = (session.segregationOk ?? true) ? 'var(--color-success)' : 'var(--color-danger)';
  
  container.innerHTML = `
    <div class="screen" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 100vh; padding: 24px;">
      <!-- Success Icon -->
      <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-success-bg); border: var(--border-brutalist); display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>

      <h2 class="text-heading-lg" style="margin-bottom: 12px; font-size: 2.2rem; font-style: italic;">COLLECTION OK!</h2>
      <p class="text-label" style="color: var(--color-text-secondary); margin-bottom: 24px; text-transform: uppercase;">Ghar ka kachra record ho gaya hai.</p>

      <!-- Summary card -->
      <div class="card-brutalist" style="background: white; padding: 20px; width: 100%; max-width: 360px; margin-bottom: 32px; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span class="text-label">ADDRESS:</span>
          <span style="font-weight: bold;">${session.householdAddress?.split(',')[0]}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span class="text-label">TYPE:</span>
          <span style="font-weight: bold; text-transform: uppercase;">${session.wasteType}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span class="text-label">SEGREGATED:</span>
          <span>${session.segregationOk ? '✓ Sahi' : '✗ Galat'}</span>
        </div>
        <div class="divider" style="margin: 10px 0;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
          <span class="text-label">CITIZEN POINTS:</span>
          <span style="color: ${pointsColor}; font-size: 1.1rem;">${points}</span>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 12px;">
        <button id="next-home-btn" class="btn btn-primary btn-block">Agla Ghar (Next Stop) ➡️</button>
        <button id="back-dashboard-btn" class="btn btn-outline btn-block">Dashboard 🏠</button>
      </div>
    </div>
  `;

  // Reset session
  store.set('currentSession', null);

  document.getElementById('next-home-btn').addEventListener('click', () => {
    router.navigate('#/worker/queue');
  });

  document.getElementById('back-dashboard-btn').addEventListener('click', () => {
    router.navigate('#/worker/dashboard');
  });
}

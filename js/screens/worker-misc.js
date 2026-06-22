/**
 * Sahi Bin - Worker Secondary Screens Module
 * Consolidates History, Details, Performance, Monthly Stats, Leaderboard, Profile, and Notifications.
 */

import { router } from '../router.js';
import { store } from '../state.js';
import { showToast, formatDate, formatTime } from '../utils.js';
import { renderHeader } from '../../components/header.js';
import { renderBottomNav, WORKER_HOME_TABS, WORKER_PERF_TABS } from '../../components/bottom-nav.js';
import { renderButton } from '../../components/button.js';
import { renderBarChart } from '../../components/chart.js';
import { getWasteLogsByWorker, getDocument, getAreaLeaderboard, getNotifications, markAsRead, getActiveAnnouncements, logout } from '../firebase/db-service.js';

// ============================================================================
// 1. COLLECTION HISTORY
// ============================================================================

export async function renderWorkerHistory(container) {
  const user = store.get('currentUser') || { uid: 'worker_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING COLLECTION HISTORY...</p>
    </div>
  `;

  let logs = [];
  try {
    logs = await getWasteLogsByWorker(user.uid || 'worker_001');
  } catch (err) {
    console.warn('Failed to load history logs:', err);
  }

  // Fallback mocks
  if (logs.length === 0) {
    logs = [
      { id: 'col_001', householdId: 'hh_001', address: 'House #42, Gandhi Nagar', wasteType: 'wet', isSegregated: true, weightKg: 1.5, timestamp: new Date(), verificationMethod: 'gps' },
      { id: 'col_002', householdId: 'hh_002', address: 'House #56, Gandhi Nagar', wasteType: 'dry', isSegregated: true, weightKg: 0.8, timestamp: new Date(Date.now() - 3600000), verificationMethod: 'qr' },
      { id: 'col_003', householdId: 'hh_003', address: 'House #104, Gandhi Nagar', wasteType: 'mixed', isSegregated: false, weightKg: 2.1, timestamp: new Date(Date.now() - 7200000), verificationMethod: 'manual' }
    ];
  }

  const headerHtml = renderHeader({
    title: 'COLLECTION HISTORY',
    backButton: true
  });

  const logsListHtml = logs.map(l => {
    const typeLabel = l.wasteType === 'wet' ? 'Wet (Geela)' : (l.wasteType === 'dry' ? 'Dry (Sookha)' : 'Mixed');
    const badgeClass = l.wasteType === 'wet' ? 'badge--success' : (l.wasteType === 'dry' ? 'badge--info' : 'badge--danger');
    const segStatus = l.isSegregated ? '✓ Segregated' : '✗ Mixed';
    const methodBadge = l.verificationMethod === 'gps' ? 'verification-badge--gps' : (l.verificationMethod === 'qr' ? 'verification-badge--qr' : 'verification-badge--manual');
    
    return `
      <div class="card-brutalist list-item-collection" data-id="${l.id}" style="background: white; padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="text-label" style="font-size: 1rem;">${l.address || 'House Detail'}</span>
          <span class="badge ${badgeClass}">${typeLabel}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--color-text-secondary);">
          <span>${formatDate(l.timestamp)} | ${formatTime(l.timestamp)}</span>
          <span>${segStatus}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.8125rem; font-weight: bold;">Vajan: ${l.weightKg} KG</span>
          <span class="verification-badge ${methodBadge}" style="font-size: 0.625rem; text-transform: uppercase;">Verified: ${l.verificationMethod}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">PURAANI COLLECTIONS</h2>
      
      <div id="history-logs-container">
        ${logsListHtml || '<p style="text-align: center; color: var(--color-text-muted);">Koi collection nahi mila.</p>'}
      </div>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  // Listeners
  const items = container.querySelectorAll('.list-item-collection');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      router.navigate(`#/worker/history/${id}`);
    });
  });
}

// ============================================================================
// 2. COLLECTION DETAILS
// ============================================================================

export async function renderWorkerCollectionDetails(container, params) {
  const colId = params.id;
  
  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING DETAILS...</p>
    </div>
  `;

  let log = null;
  try {
    log = await getDocument('waste_logs', colId);
  } catch (err) {
    console.warn('Failed to load collection details:', err);
  }

  // Fallback
  if (!log) {
    log = {
      id: colId,
      address: 'House #42, Gandhi Nagar, Sector 4',
      wasteType: 'wet',
      isSegregated: true,
      weightKg: 1.5,
      timestamp: new Date(),
      verificationMethod: 'gps',
      imageUrl: 'https://images.unsplash.com/photo-1605600611283-c48a6836dd16?q=80&w=400', // Mock garbage image
      workerName: 'Ramesh Kumar'
    };
  }

  const headerHtml = renderHeader({
    title: 'DETAILS',
    backButton: true
  });

  const typeBg = log.wasteType === 'wet' ? 'var(--color-success-bg)' : (log.wasteType === 'dry' ? 'var(--color-info-bg)' : 'var(--color-danger-bg)');
  const typeColor = log.wasteType === 'wet' ? '#2E7D32' : (log.wasteType === 'dry' ? '#1A237E' : 'var(--color-danger)');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      
      <!-- Kachra Image -->
      <div style="width: 100%; height: 240px; border: var(--border-brutalist); border-radius: var(--radius); overflow: hidden; margin-bottom: 20px; background: #eee;">
        <img src="${log.imageUrl || 'https://placehold.co/400x240/1B6B3C/FFF?text=Kachra+Photo'}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      <div class="card-brutalist" style="background: white; padding: 20px; margin-bottom: 20px;">
        <span class="badge badge--primary" style="margin-bottom: 12px; background: ${typeBg}; color: ${typeColor};">${log.wasteType.toUpperCase()} WASTE</span>
        <h2 class="text-heading-sm" style="font-size: 1.25rem; margin-bottom: 8px;">${log.address}</h2>
        <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 16px;">
          Saved on: ${formatDate(log.timestamp)} | ${formatTime(log.timestamp)}
        </p>

        <div class="divider" style="margin: 16px 0;"></div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9375rem;">
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Vajan (Weight):</span>
            <span style="font-weight: bold;">${log.weightKg} KG</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Segregation Status:</span>
            <span style="font-weight: bold;">${log.isSegregated ? 'Sahi (Segregated)' : 'Galat (Mixed)'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Verification:</span>
            <span class="badge badge--success" style="text-transform: uppercase;">${log.verificationMethod} Verified</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Safai Mitra:</span>
            <span>${log.workerName || 'Ramesh Kumar'}</span>
          </div>
        </div>
      </div>

      <button id="details-back-btn" class="btn btn-outline btn-block">Back to History</button>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  document.getElementById('details-back-btn').addEventListener('click', () => {
    window.history.back();
  });
}

// ============================================================================
// 3. WORKER PERFORMANCE
// ============================================================================

export function renderPerformance(container) {
  const headerHtml = renderHeader({
    title: 'PERFORMANCE',
    showMenu: true
  });

  const weeklyData = [
    { label: 'M', value: 18, color: 'var(--color-primary)' },
    { label: 'T', value: 22, color: 'var(--color-primary)' },
    { label: 'W', value: 20, color: 'var(--color-primary)' },
    { label: 'T', value: 25, color: 'var(--color-primary)' },
    { label: 'F', value: 19, color: 'var(--color-primary)' },
    { label: 'S', value: 15, color: 'var(--color-primary)' },
    { label: 'S', value: 9, color: 'var(--color-accent)' }
  ];

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-lg" style="margin-bottom: 4px; font-style: italic;">WORKER PERFORMANCE</h2>
      <p class="text-body-sm" style="color: var(--color-text-secondary); margin-bottom: 20px;">Aapka aaj ka kaam aur ranking.</p>

      <!-- Hero Card -->
      <div class="card-brutalist" style="background: var(--color-primary); color: white; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 class="text-heading-sm" style="margin: 0; color: white;">TOP 10% IN AREA</h3>
            <p style="font-size: 0.8125rem; opacity: 0.8;">Sector 4, Dwarka</p>
          </div>
          <div class="text-heading-xl" style="font-size: 2.2rem; color: white; margin: 0;">RANK #3</div>
        </div>
      </div>

      <!-- Stats Tile Grid -->
      <div class="stat-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div class="card-stat" style="background: white; border-color: var(--color-border);">
          <span style="font-size: 1.5rem;">🏠</span>
          <div class="text-label" style="font-size: 0.75rem; margin-top: 4px;">GHAR COLLECTED</div>
          <div class="text-heading-sm" style="font-size: 1.5rem; margin-top: 4px;">128</div>
        </div>
        <div class="card-stat" style="background: var(--color-success-bg); border-color: var(--color-border);">
          <span style="font-size: 1.5rem;">⭐️</span>
          <div class="text-label" style="font-size: 0.75rem; margin-top: 4px;">INAAM POINTS</div>
          <div class="text-heading-sm" style="font-size: 1.5rem; margin-top: 4px;">450</div>
        </div>
      </div>

      <!-- Weekly Trends Chart -->
      <div class="card-brutalist" style="background: white; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="text-heading-sm" style="margin: 0;">WEEKLY TRENDS</span>
          <span style="color: var(--color-success); font-weight: bold; font-size: 0.875rem;">+12% vs Last Week</span>
        </div>
        ${renderBarChart(weeklyData, { height: 140, showLabels: true, showValues: true, maxValue: 30 })}
      </div>

      <!-- Achievements -->
      <h3 class="text-heading-sm" style="margin-bottom: 12px;">ACHIEVEMENTS</h3>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
        <div class="card-brutalist card-brutalist--flat" style="background: white; padding: 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
          <span style="font-size: 1.8rem; background: var(--color-warning-bg); padding: 8px; border-radius: 8px;">⚡️</span>
          <div>
            <div class="text-label" style="margin: 0;">FASTEST ROUTE (Sabse tez collection)</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Completed collection 30 mins before target.</div>
          </div>
        </div>
        
        <div class="card-brutalist card-brutalist--flat" style="background: white; padding: 12px; display: flex; align-items: center; gap: 12px; margin-bottom: 0;">
          <span style="font-size: 1.8rem; background: var(--color-success-bg); padding: 8px; border-radius: 8px;">🌿</span>
          <div>
            <div class="text-label" style="margin: 0;">GREEN HERO (Ssegregation support)</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Maintained 95%+ segregation correctness for 7 days.</div>
          </div>
        </div>
      </div>

      <a href="#/worker/performance/monthly" class="btn btn-outline btn-block" style="text-align: center; font-weight: bold; padding: 12px;">VIEW MONTHLY INSIGHTS 📊</a>
    </div>
    
    ${renderBottomNav(WORKER_PERF_TABS, '#/worker/performance')}
  `;
}

// ============================================================================
// 4. MONTHLY PERFORMANCE
// ============================================================================

export function renderMonthlyPerformance(container) {
  const headerHtml = renderHeader({
    title: 'MONTHLY PERFORMANCE',
    backButton: true
  });

  container.innerHTML = `
    ${headerHtml}
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      
      <!-- Month Selection -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <button class="btn btn-outline" style="padding: 6px 12px;">&lt; May</button>
        <span class="text-heading-sm" style="font-size: 1.25rem;">JUNE 2026</span>
        <button class="btn btn-outline" style="padding: 6px 12px;" disabled>July &gt;</button>
      </div>

      <!-- Performance Cards -->
      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 16px;">
        <div class="text-caption" style="color: var(--color-text-secondary);">TOTAL HOUSES SERVICED</div>
        <div class="text-heading-lg" style="font-size: 2.2rem; color: var(--color-primary); margin: 4px 0;">342 Houses</div>
        <p style="font-size: 0.8125rem; color: var(--color-success); font-weight: bold;">+8% over area average (316)</p>
      </div>

      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 16px;">
        <div class="text-caption" style="color: var(--color-text-secondary);">SEGREGATION ACCURACY</div>
        <div class="text-heading-lg" style="font-size: 2.2rem; color: var(--color-accent); margin: 4px 0;">92% Correct</div>
        <p style="font-size: 0.8125rem; color: var(--color-success); font-weight: bold;">Top 15 Safai Mitras in Zone</p>
      </div>

      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 20px;">
        <div class="text-caption" style="color: var(--color-text-secondary);">ROUTE COMPLETION RATE</div>
        <div class="text-heading-lg" style="font-size: 2.2rem; color: var(--color-warning); margin: 4px 0;">98.4% Completed</div>
        <p style="font-size: 0.8125rem; color: var(--color-text-secondary);">Planned stops: 350 | Serviced: 342 | Skipped: 8</p>
      </div>

      <button id="monthly-back-btn" class="btn btn-outline btn-block">Go Back</button>
    </div>
    ${renderBottomNav(WORKER_PERF_TABS, '#/worker/performance')}
  `;

  document.getElementById('monthly-back-btn').addEventListener('click', () => {
    window.history.back();
  });
}

// ============================================================================
// 5. LEADERBOARD POSITION
// ============================================================================

export async function renderLeaderboard(container) {
  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING LEADERBOARD...</p>
    </div>
  `;

  let leaders = [];
  try {
    leaders = await getAreaLeaderboard('area_001');
  } catch (err) {
    console.warn('Failed to load leaderboard:', err);
  }

  if (leaders.length === 0) {
    leaders = [
      { workerId: 'w_001', name: 'Sohan Lal', completedStops: 145, segregationRate: 97, avatarUrl: null },
      { workerId: 'w_002', name: 'Vikram Singh', completedStops: 138, segregationRate: 95, avatarUrl: null },
      { workerId: 'worker_001', name: 'Ramesh Kumar (Aap)', completedStops: 128, segregationRate: 92, avatarUrl: null },
      { workerId: 'w_003', name: 'Raju Sharma', completedStops: 120, segregationRate: 88, avatarUrl: null }
    ];
  }

  const headerHtml = renderHeader({
    title: 'INAAM LEADERBOARD',
    showMenu: true
  });

  const rankRowsHtml = leaders.map((l, index) => {
    const isCurrent = l.workerId === 'worker_001';
    const borderStyle = isCurrent ? 'border-color: var(--color-accent); border-width: 3px;' : '';
    const nameColor = isCurrent ? 'var(--color-accent)' : 'var(--color-text)';
    
    let medal = '';
    if (index === 0) medal = '🥇';
    else if (index === 1) medal = '🥈';
    else if (index === 2) medal = '🥉';
    else medal = `#${index + 1}`;

    return `
      <div class="card-brutalist" style="background: white; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; ${borderStyle} margin-bottom: 10px;">
        <span style="font-size: 1.25rem; font-weight: bold; width: 30px; text-align: center;">${medal}</span>
        <div style="flex-grow: 1;">
          <div class="text-label" style="color: ${nameColor};">${l.name}</div>
          <div class="text-caption">${l.completedStops} Houses | Segregation: ${l.segregationRate}%</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <div class="card-brutalist" style="background: var(--color-accent-light); padding: 16px; margin-bottom: 20px; text-align: center;">
        <h2 class="text-heading-sm" style="color: #1A237E; margin: 0 0 4px 0;">AAPKA CURRENT RANK</h2>
        <div class="text-heading-lg" style="font-size: 2.2rem; color: #1A237E; margin: 0;">#3 IN ZONE</div>
      </div>

      <h3 class="text-heading-sm" style="margin-bottom: 12px;">TOP SAFAI MITRAS</h3>
      <div id="leaderboard-list">
        ${rankRowsHtml}
      </div>
    </div>
    ${renderBottomNav(WORKER_PERF_TABS, '#/worker/leaderboard')}
  `;
}

// ============================================================================
// 6. WORKER PROFILE
// ============================================================================

export function renderWorkerProfile(container) {
  const user = store.get('currentUser') || { name: 'Ramesh Kumar', email: 'ramesh@example.com', phone: '+91 98765 43210' };
  
  const headerHtml = renderHeader({
    title: 'PROFILE',
    showMenu: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Profile Header -->
      <div class="card-brutalist" style="background: white; padding: 20px; display: flex; align-items: center; gap: 16px;">
        <div class="avatar avatar--lg" style="background: var(--color-accent);">RK</div>
        <div>
          <h2 class="text-heading-sm" style="font-size: 1.3rem; margin: 0;">${user.name}</h2>
          <p style="font-size: 0.8125rem; color: var(--color-text-secondary);">Employee ID: SB-W-1042</p>
        </div>
      </div>

      <!-- Info Card -->
      <div class="card-brutalist" style="background: white; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
        <div>
          <span class="text-caption">PHONE NUMBER</span>
          <div class="text-label" style="font-size: 1.05rem;">${user.phone}</div>
        </div>
        <div class="divider" style="margin: 0;"></div>
        <div>
          <span class="text-caption">EMAIL ADDRESS</span>
          <div class="text-label" style="font-size: 1.05rem;">${user.email}</div>
        </div>
        <div class="divider" style="margin: 0;"></div>
        <div>
          <span class="text-caption">ASSIGNED AREA</span>
          <div class="text-label" style="font-size: 1.05rem;">Sector 4, Dwarka (Zone 1)</div>
        </div>
      </div>

      <!-- Shift toggle -->
      <div class="card-brutalist" style="background: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div class="text-label">SHIFT DUTY STATUS</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Turn off to pause stops auto-routing</div>
        </div>
        <div>
          <button id="shift-toggle-btn" class="btn btn-outline" style="padding: 6px 12px; font-weight: bold; background: #E8F5E9; border-color: #2E7D32;">ACTIVE</button>
        </div>
      </div>

      <!-- Logout -->
      <button id="worker-logout-btn" class="btn btn-danger btn-block" style="box-shadow: 4px 4px 0px #1A1A1A;">LOGOUT (Baharein)</button>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/profile')}
  `;

  // Toggle Shift
  let shiftActive = true;
  document.getElementById('shift-toggle-btn').addEventListener('click', () => {
    shiftActive = !shiftActive;
    const btn = document.getElementById('shift-toggle-btn');
    if (shiftActive) {
      btn.innerText = 'ACTIVE';
      btn.style.background = '#E8F5E9';
      btn.style.borderColor = '#2E7D32';
      showToast('Duty status: On Shift', 'success');
    } else {
      btn.innerText = 'INACTIVE';
      btn.style.background = '#FFCDD2';
      btn.style.borderColor = '#D32F2F';
      showToast('Duty status: Off Shift', 'warning');
    }
  });

  // Logout
  document.getElementById('worker-logout-btn').addEventListener('click', async () => {
    if (confirm('Kya aap logout karna chahte hain?')) {
      try {
        await logout();
        store.clear();
        router.navigate('#/');
      } catch (err) {
        showToast('Logout error: ' + err.message, 'error');
      }
    }
  });
}

// ============================================================================
// 7. WORKER NOTIFICATIONS
// ============================================================================

export async function renderWorkerNotifications(container) {
  const user = store.get('currentUser') || { uid: 'worker_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING NOTIFICATIONS...</p>
    </div>
  `;

  let notifs = [];
  try {
    notifs = await getNotifications(user.uid);
  } catch (err) {
    console.warn('Failed to load notifications:', err);
  }

  if (notifs.length === 0) {
    notifs = [
      { id: 'wn_001', category: 'announcement', title: '📢 Safai Abhiyan Notice', body: 'Is Sunday Sector 4 mein special cleanliness drive hai.', read: false, timestamp: new Date() },
      { id: 'wn_002', category: 'schedule', title: 'Route Updation', body: 'Aapki daily stops list update ki gayi hai.', read: true, timestamp: new Date(Date.now() - 86400000) }
    ];
  }

  const headerHtml = renderHeader({
    title: 'NOTIFICATIONS',
    backButton: true
  });

  const notifsHtml = notifs.map(n => {
    const unreadStyle = !n.read ? 'border-left: 6px solid var(--color-accent);' : '';
    return `
      <div class="card-brutalist notif-card" data-id="${n.id}" style="background: white; padding: 14px; margin-bottom: 10px; cursor: pointer; ${unreadStyle} display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span style="font-size: 0.9375rem;">${n.title}</span>
          <span style="font-size: 0.75rem; color: var(--color-text-secondary);">${formatDate(n.timestamp)}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0;">${n.body}</p>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">NOTIFICATIONS</h2>
      
      <div id="worker-notifs-list">
        ${notifsHtml}
      </div>
    </div>
    ${renderBottomNav(WORKER_HOME_TABS, '#/worker/dashboard')}
  `;

  // Attach mark as read listeners
  const cards = container.querySelectorAll('.notif-card');
  cards.forEach(card => {
    card.addEventListener('click', async () => {
      const id = card.getAttribute('data-id');
      try {
        await markAsRead(id);
        card.style.borderLeft = 'none';
        showToast('Marked as read', 'info');
      } catch (err) {
        console.warn('Failed to mark read:', err);
      }
    });
  });
}

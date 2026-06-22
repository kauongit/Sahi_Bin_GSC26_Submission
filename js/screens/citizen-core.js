/**
 * Sahi Bin - Citizen Core Screens Module
 * Consolidates Citizen Dashboard, History, Details, Calendar, and Timeline.
 */

import { router } from '../router.js';
import { store } from '../state.js';
import { showToast, formatDate, formatTime, getGreeting } from '../utils.js';
import { renderHeader } from '../../components/header.js';
import { renderBottomNav, CITIZEN_TABS } from '../../components/bottom-nav.js';
import { renderButton } from '../../components/button.js';
import { renderScoreCircle } from '../../components/score-circle.js';
import { renderTimeline } from '../../components/timeline.js';
import { getWasteLogsByCitizen, getDocument, getSegregationScore, getNextCollection, calculateTotalPoints } from '../firebase/db-service.js';

// ============================================================================
// 1. CITIZEN DASHBOARD
// ============================================================================

export async function renderCitizenDashboard(container) {
  const user = store.get('currentUser') || { name: 'Citizen', householdId: 'hh_001', areaId: 'area_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING CITIZEN DASHBOARD...</p>
    </div>
  `;

  // Fetch metrics asynchronously
  let score = 87;
  let points = 1250;
  let nextTimeSlot = '7:00 AM - 9:00 AM';
  let nextDay = 'Kal Subah (Tomorrow)';

  try {
    score = await getSegregationScore(user.householdId || 'hh_001');
    points = await calculateTotalPoints(user.uid || 'cit_001');
    const schedule = await getNextCollection(user.areaId || 'area_001');
    if (schedule) {
      nextTimeSlot = schedule.timeSlot || nextTimeSlot;
    }
  } catch (err) {
    console.warn('Failed to load citizen dashboard data:', err);
  }

  // Update points in store
  const rState = store.get('rewards') || {};
  rState.points = points;
  store.set('rewards', rState);

  const headerHtml = renderHeader({
    title: 'SAHI BIN',
    showMenu: true,
    showAvatar: true,
    roleBadge: 'NIVASI MODE',
    avatarUrl: user.avatarUrl
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-bottom: 80px; padding-top: 80px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Greeting -->
      <div>
        <h2 class="text-heading-md" style="font-size: 1.5rem; text-transform: uppercase;">${getGreeting()}, ${user.name.split(' ')[0]}!</h2>
        <p class="text-body-sm" style="color: var(--color-text-secondary);">Clean and green city banayein.</p>
      </div>

      <!-- Segregation Score Circle -->
      <div class="card-brutalist" style="background: white; padding: 20px; display: flex; align-items: center; justify-content: space-around; gap: 16px;">
        <div style="flex-shrink: 0;">
          ${renderScoreCircle(score, { size: 'lg', showPercentage: true })}
        </div>
        <div>
          <h3 class="text-heading-sm" style="margin: 0 0 4px 0;">SEGREGATION SCORE</h3>
          <p class="text-body-sm" style="color: var(--color-text-secondary); margin-bottom: 8px;">Aapka kachra alag karne ka rate.</p>
          <a href="#/citizen/timeline" style="color: var(--color-primary); font-weight: bold; text-decoration: underline; font-size: 0.875rem;">Score Timeline ↗</a>
        </div>
      </div>

      <!-- Points & Rewards Card -->
      <div class="card-brutalist" style="background: var(--color-primary); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span class="text-caption" style="color: white; opacity: 0.8;">REWARD POINTS AVAILABLE</span>
          <div class="text-heading-lg" style="font-size: 2.2rem; color: white; margin: 4px 0;">${points} PTS</div>
        </div>
        <a href="#/citizen/rewards" class="btn btn-secondary" style="box-shadow: 2px 2px 0 #1A1A1A; padding: 8px 16px; font-size: 0.875rem;">Redeem 🎁</a>
      </div>

      <!-- Next Collection Card -->
      <div class="card-brutalist" style="background: white; padding: 16px; border-color: var(--color-accent);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="text-label" style="color: var(--color-accent);">NEXT COLLECTION</span>
          <a href="#/citizen/calendar" style="font-size: 0.75rem; font-weight: bold; text-decoration: underline;">Full Calendar</a>
        </div>
        <p class="text-heading-sm" style="font-size: 1.1rem; margin: 0 0 4px 0;">⏰ ${nextDay}</p>
        <p style="font-size: 0.8125rem; color: var(--color-text-secondary);">Estimated time slot: ${nextTimeSlot}</p>
      </div>

      <!-- Action grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
        <a href="#/citizen/complaints" class="btn btn-outline" style="text-align: center; justify-content: center; font-size: 0.875rem; padding: 12px;">Raise Complaint ⚠️</a>
        <a href="#/citizen/sustainability" class="btn btn-outline" style="text-align: center; justify-content: center; font-size: 0.875rem; padding: 12px;">Insights 📊</a>
      </div>

    </div>
    
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;
}

// ============================================================================
// 2. CITIZEN COLLECTION HISTORY
// ============================================================================

export async function renderCitizenHistory(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING COLLECTION HISTORY...</p>
    </div>
  `;

  let logs = [];
  try {
    logs = await getWasteLogsByCitizen(user.uid || 'cit_001');
  } catch (err) {
    console.warn('Failed to load citizen logs:', err);
  }

  // Mocks
  if (logs.length === 0) {
    logs = [
      { id: 'col_c01', timestamp: new Date(), wasteType: 'wet', isSegregated: true, weightKg: 0.8, pointsAwarded: 20 },
      { id: 'col_c02', timestamp: new Date(Date.now() - 86400000), wasteType: 'dry', isSegregated: true, weightKg: 1.2, pointsAwarded: 20 },
      { id: 'col_c03', timestamp: new Date(Date.now() - 172800000), wasteType: 'mixed', isSegregated: false, weightKg: 1.5, pointsAwarded: -10 }
    ];
  }

  const headerHtml = renderHeader({
    title: 'COLLECTION HISTORY',
    backButton: true
  });

  const logsHtml = logs.map(l => {
    const isWet = l.wasteType === 'wet';
    const isDry = l.wasteType === 'dry';
    const typeLabel = isWet ? 'Wet (Geela)' : (isDry ? 'Dry (Sookha)' : 'Mixed');
    const badgeClass = isWet ? 'badge--success' : (isDry ? 'badge--info' : 'badge--danger');
    const pointsText = l.pointsAwarded >= 0 ? `+${l.pointsAwarded}` : l.pointsAwarded;
    const pointsColor = l.pointsAwarded >= 0 ? 'var(--color-success)' : 'var(--color-danger)';

    return `
      <div class="card-brutalist list-item-c-col" data-id="${l.id}" style="background: white; padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="text-label" style="font-size: 1.05rem;">${formatDate(l.timestamp)}</span>
          <span class="badge ${badgeClass}">${typeLabel}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
          <span style="color: var(--color-text-secondary);">${formatTime(l.timestamp)} | Weight: ${l.weightKg} KG</span>
          <span style="font-weight: bold; color: ${pointsColor};">${pointsText} PTS</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">AAPKA KACHRA RECORD</h2>
      
      <div id="c-history-logs">
        ${logsHtml}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/history')}
  `;

  // Attach listener
  const cards = container.querySelectorAll('.list-item-c-col');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      router.navigate(`#/citizen/history/${id}`);
    });
  });
}

// ============================================================================
// 3. CITIZEN COLLECTION DETAILS
// ============================================================================

export async function renderCitizenCollectionDetails(container, params) {
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
    console.warn(err);
  }

  if (!log) {
    log = {
      id: colId,
      timestamp: new Date(),
      wasteType: 'wet',
      isSegregated: true,
      weightKg: 0.8,
      pointsAwarded: 20,
      workerName: 'Suresh Yadav',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400'
    };
  }

  const headerHtml = renderHeader({
    title: 'COLLECTION DETAILS',
    backButton: true
  });

  const typeBg = log.wasteType === 'wet' ? 'var(--color-success-bg)' : (log.wasteType === 'dry' ? 'var(--color-info-bg)' : 'var(--color-danger-bg)');
  const typeColor = log.wasteType === 'wet' ? '#2E7D32' : (log.wasteType === 'dry' ? '#1A237E' : 'var(--color-danger)');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <div style="width: 100%; height: 200px; border: var(--border-brutalist); border-radius: var(--radius); overflow: hidden; margin-bottom: 20px; background: #eee;">
        <img src="${log.imageUrl || 'https://placehold.co/400x200/1B6B3C/FFF?text=No+Photo'}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      <div class="card-brutalist" style="background: white; padding: 20px; margin-bottom: 24px;">
        <span class="badge" style="background: ${typeBg}; color: ${typeColor}; margin-bottom: 12px;">${log.wasteType.toUpperCase()} WASTE</span>
        <h2 class="text-heading-sm" style="margin-bottom: 6px;">Collection Date: ${formatDate(log.timestamp)}</h2>
        <p style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-bottom: 16px;">Collected at: ${formatTime(log.timestamp)}</p>
        
        <div class="divider" style="margin: 16px 0;"></div>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9375rem;">
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Kachre ka vajan (Weight):</span>
            <span style="font-weight: bold;">${log.weightKg} KG</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Segregation status:</span>
            <span style="font-weight: bold;">${log.isSegregated ? '✓ Sahi (Segregated)' : '✗ Galat (Mixed)'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Points Awarded/Deducted:</span>
            <span style="font-weight: bold; color: ${log.pointsAwarded >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
              ${log.pointsAwarded >= 0 ? '+' : ''}${log.pointsAwarded} PTS
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-label">Worker assigned:</span>
            <span>${log.workerName || 'Suresh Yadav'}</span>
          </div>
        </div>
      </div>

      <button id="detail-back-btn" class="btn btn-outline btn-block">Back to History</button>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;

  document.getElementById('detail-back-btn').addEventListener('click', () => {
    window.history.back();
  });
}

// ============================================================================
// 4. COLLECTION CALENDAR
// ============================================================================

export function renderCollectionCalendar(container) {
  const headerHtml = renderHeader({
    title: 'CALENDAR',
    backButton: true
  });

  // Simple static calendar grid representation for June 2026
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const calendarDaysHtml = days.map(d => {
    // Inject mock statuses for colors
    // 8, 15, 22 are mixed waste (amber/red dot), others segregated (green dot), sundays missed/no collection (grey)
    let dotColor = '#4CAF50'; // Green
    if ([8, 15, 20].includes(d)) dotColor = '#F9A825'; // Mixed (Amber)
    if ([7, 14, 21, 28].includes(d)) dotColor = '#bbb'; // Sunday (Grey)
    
    return `
      <div style="aspect-ratio: 1; border: 1px solid var(--color-divider); display: flex; flex-direction: column; justify-content: space-between; padding: 4px; position: relative;">
        <span style="font-weight: bold; font-size: 0.8125rem;">${d}</span>
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; align-self: center; margin-bottom: 4px;"></span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 12px; font-style: italic;">JUNE 2026 STATUS</h2>
      
      <!-- Calendar Grid Header (Mon-Sun) -->
      <div class="card-brutalist" style="background: white; padding: 12px;">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; font-size: 0.75rem; margin-bottom: 12px; color: var(--color-text-secondary);">
          <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; border: 1px solid var(--color-divider);">
          <!-- Empty spaces for calendar alignment (June 2026 starts on Mon) -->
          ${calendarDaysHtml}
        </div>
      </div>

      <!-- Color Codes Legend -->
      <div class="card-brutalist" style="background: white; padding: 12px; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; font-size: 0.8125rem;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #4CAF50;"></span>
          <span>Sahi Segregation (Properly Segregated)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #F9A825;"></span>
          <span>Mixed Waste Collection (Mixed Kachra)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background: #bbb;"></span>
          <span>No Collection / Missed Stop</span>
        </div>
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;
}

// ============================================================================
// 5. SEGREGATION SCORE TIMELINE
// ============================================================================

export function renderSegregationTimeline(container) {
  const headerHtml = renderHeader({
    title: 'TIMELINE',
    backButton: true
  });

  const timelineItems = [
    { date: '22 Jun 2026', title: '🥬 Wet waste collection completed', description: 'Score maintained at 87%. Sahi segregation bonus added.', color: 'var(--color-success)' },
    { date: '21 Jun 2026', title: '📦 Dry waste collection completed', description: 'Clean plastic bottles detected.', color: 'var(--color-success)' },
    { date: '20 Jun 2026', title: '⚠️ Mixed waste collection flagged', description: 'Score dropped -2%. Plastic bags mixed with kitchen waste.', color: 'var(--color-danger)' },
    { date: '19 Jun 2026', title: '🥬 Wet waste collection completed', description: 'Excellent segregation rate today.', color: 'var(--color-success)' }
  ];

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px; font-style: italic;">SEGREGATION SCORE TIMELINE</h2>
      
      <div class="card-brutalist" style="background: white; padding: 20px;">
        ${renderTimeline(timelineItems)}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;
}

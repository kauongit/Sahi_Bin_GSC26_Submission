/**
 * Sahi Bin - Citizen Rewards System Screens
 * Consolidates Rewards Dashboard, Store, Success, and Points History.
 */

import { router } from '../router.js';
import { store } from '../state.js';
import { showToast, formatDate } from '../utils.js';
import { renderHeader } from '../../components/header.js';
import { renderBottomNav, CITIZEN_TABS } from '../../components/bottom-nav.js';
import { renderButton } from '../../components/button.js';
import { getRewardPoints, getRewardTransactions, getRewardStoreItems, redeemReward } from '../firebase/db-service.js';

// ============================================================================
// 1. REWARDS DASHBOARD
// ============================================================================

export async function renderRewardsDashboard(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING REWARDS...</p>
    </div>
  `;

  let points = 1250;
  try {
    points = await getRewardPoints(user.uid);
  } catch (err) {
    console.warn(err);
  }

  const headerHtml = renderHeader({
    title: 'MY REWARDS',
    backButton: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Point display hero -->
      <div class="card-brutalist" style="background: var(--color-success-bg); border-color: var(--color-success); padding: 24px; text-align: center;">
        <span class="text-caption" style="color: #1b5e20;">CURRENT BALANCE</span>
        <h2 class="text-heading-lg" style="font-size: 2.8rem; color: #1b5e20; margin: 8px 0;">${points} PTS</h2>
        <p class="text-body-sm" style="color: #1b5e20;">Keep segregating to earn more!</p>
      </div>

      <!-- Action buttons -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="#/citizen/rewards/store" class="btn btn-primary btn-block" style="text-align: center; justify-content: center; font-size: 1.1rem; padding: 14px;">Redeem Store 🎁</a>
        <a href="#/citizen/rewards/history" class="btn btn-outline btn-block" style="text-align: center; justify-content: center; padding: 12px;">Points History ⏱️</a>
      </div>

      <!-- Streak Milestone card -->
      <div class="card-brutalist" style="background: white; padding: 16px;">
        <h3 class="text-heading-sm" style="margin-bottom: 8px;">🔥 5-DAY SEGREGATION STREAK</h3>
        <p class="text-body-sm" style="color: var(--color-text-secondary); margin-bottom: 12px;">Get a +50 bonus points on completing a 7-day streak.</p>
        
        <div style="display: flex; gap: 8px; justify-content: space-between;">
          <span style="font-size: 1.5rem; background: var(--color-success-bg); padding: 4px 8px; border-radius: 4px;">M</span>
          <span style="font-size: 1.5rem; background: var(--color-success-bg); padding: 4px 8px; border-radius: 4px;">T</span>
          <span style="font-size: 1.5rem; background: var(--color-success-bg); padding: 4px 8px; border-radius: 4px;">W</span>
          <span style="font-size: 1.5rem; background: var(--color-success-bg); padding: 4px 8px; border-radius: 4px;">T</span>
          <span style="font-size: 1.5rem; background: var(--color-success-bg); padding: 4px 8px; border-radius: 4px;">F</span>
          <span style="font-size: 1.5rem; background: #eee; padding: 4px 8px; border-radius: 4px; opacity: 0.5;">S</span>
          <span style="font-size: 1.5rem; background: #eee; padding: 4px 8px; border-radius: 4px; opacity: 0.5;">S</span>
        </div>
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/rewards')}
  `;
}

// ============================================================================
// 2. REWARD STORE
// ============================================================================

export async function renderRewardStore(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING STORE ITEMS...</p>
    </div>
  `;

  let items = [];
  try {
    items = await getRewardStoreItems();
  } catch (err) {
    console.warn(err);
  }

  // Mocks
  if (items.length === 0) {
    items = [
      { id: 'rw_001', title: '₹50 Amazon Voucher', category: 'vouchers', pointsCost: 200, inStock: true, description: 'Amazon gift card worth ₹50' },
      { id: 'rw_002', title: '₹100 BigBasket Voucher', category: 'vouchers', pointsCost: 400, inStock: true, description: 'BigBasket gift card worth ₹100' },
      { id: 'rw_003', title: '10% Electricity Discount', category: 'discounts', pointsCost: 500, inStock: true, description: '10% off on next electricity bill' },
      { id: 'rw_004', title: 'Green Citizen Certificate', category: 'certificates', pointsCost: 1000, inStock: true, description: 'Official green citizen certificate' }
    ];
  }

  const headerHtml = renderHeader({
    title: 'STORE',
    backButton: true
  });

  const storeGridHtml = items.map(item => {
    const disabledAttr = !item.inStock ? 'disabled' : '';
    const stockStatus = item.inStock ? 'IN STOCK' : 'OUT OF STOCK';
    const btnText = item.inStock ? `REDEEM (${item.pointsCost} PTS)` : 'OUT OF STOCK';
    
    return `
      <div class="card-brutalist" style="background: white; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <div>
          <div class="text-caption" style="color: var(--color-text-secondary); margin-bottom: 4px;">${item.category.toUpperCase()}</div>
          <h3 class="text-heading-sm" style="margin: 0 0 8px 0; font-size: 1.1rem;">${item.title}</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 16px;">${item.description}</p>
        </div>
        
        <div>
          <button class="btn btn-primary btn-block redeem-btn" data-id="${item.id}" data-cost="${item.pointsCost}" data-title="${item.title}" ${disabledAttr} style="font-size: 0.8125rem; padding: 8px;">
            ${btnText}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px; font-style: italic;">REDEEM YOUR VOUCHERS</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${storeGridHtml}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/rewards')}
  `;

  // Attach redemption logic
  const redeemButtons = container.querySelectorAll('.redeem-btn');
  redeemButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const cost = parseInt(btn.getAttribute('data-cost'));
      const title = btn.getAttribute('data-title');

      if (confirm(`Kya aap ${cost} points se ${title} redeem karna chahte hain?`)) {
        btn.disabled = true;
        btn.innerText = 'REDEEMING...';
        
        try {
          const res = await redeemReward(user.uid, id, cost);
          if (res.success) {
            showToast('Redemption successful!', 'success');
            
            // Store redeemed voucher in state for success page
            store.set('latestRedemption', {
              id,
              title,
              cost,
              code: 'SAHIBIN' + Math.floor(1000 + Math.random() * 9000)
            });
            
            router.navigate('#/citizen/rewards/success');
          }
        } catch (err) {
          showToast(err.message || 'Redemption failed', 'error');
          btn.disabled = false;
          btn.innerText = `REDEEM (${cost} PTS)`;
        }
      }
    });
  });
}

// ============================================================================
// 3. REDEMPTION SUCCESS
// ============================================================================

export function renderRewardSuccess(container) {
  const redemption = store.get('latestRedemption') || { title: 'Voucher', code: 'SAHIBIN7839', cost: 200 };

  container.innerHTML = `
    <div class="screen" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 100vh; padding: 24px;">
      <!-- Success Icon -->
      <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-success-bg); border: var(--border-brutalist); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: scaleIn 0.3s ease;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1B6B3C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>

      <h2 class="text-heading-lg" style="margin-bottom: 12px; font-size: 2.2rem; font-style: italic;">REDEEMED!</h2>
      <p class="text-label" style="color: var(--color-text-secondary); margin-bottom: 24px; text-transform: uppercase;">Aapka reward successfully claim ho gaya.</p>

      <!-- Voucher Box -->
      <div class="card-brutalist" style="background: white; padding: 24px; width: 100%; max-width: 360px; margin-bottom: 32px; border-color: var(--color-accent);">
        <span class="text-caption" style="color: var(--color-accent); font-weight: bold;">YOUR VOUCHER</span>
        <h3 class="text-heading-sm" style="font-size: 1.3rem; margin: 8px 0;">${redemption.title}</h3>
        
        <div class="divider" style="margin: 16px 0;"></div>
        
        <p style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 8px;">COPY THIS CODE TO REDEEM</p>
        <div style="background: var(--color-bg); padding: 12px; border: var(--border-brutalist); font-size: 1.5rem; font-weight: 800; font-family: monospace; letter-spacing: 0.05em; text-align: center;">
          ${redemption.code}
        </div>
      </div>

      <!-- Action -->
      <button id="store-back-btn" class="btn btn-primary btn-block btn-lg" style="box-shadow: 4px 4px 0 #1A1A1A; max-width: 360px;">Back to Store 🛒</button>
    </div>
  `;

  // Reset redemption state
  store.set('latestRedemption', null);

  document.getElementById('store-back-btn').addEventListener('click', () => {
    router.navigate('#/citizen/rewards/store');
  });
}

// ============================================================================
// 4. REWARD HISTORY
// ============================================================================

export async function renderRewardHistory(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING POINTS HISTORY...</p>
    </div>
  `;

  let txns = [];
  try {
    txns = await getRewardTransactions(user.uid);
  } catch (err) {
    console.warn(err);
  }

  // Mocks
  if (txns.length === 0) {
    txns = [
      { id: 'rt_001', type: 'credit', points: 20, reason: 'Sahi segregation - Wet waste', timestamp: new Date() },
      { id: 'rt_002', type: 'credit', points: 20, reason: 'Sahi segregation - Dry waste', timestamp: new Date(Date.now() - 86400000) },
      { id: 'rt_003', type: 'debit', points: -200, reason: 'Voucher Redeemed: ₹50 Amazon Voucher', timestamp: new Date(Date.now() - 172800000) }
    ];
  }

  const headerHtml = renderHeader({
    title: 'POINTS HISTORY',
    backButton: true
  });

  const txnsHtml = txns.map(t => {
    const isCredit = t.type === 'credit';
    const color = isCredit ? 'var(--color-success)' : 'var(--color-danger)';
    const prefix = isCredit ? '+' : '';
    
    return `
      <div class="card-brutalist" style="background: white; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <div class="text-label" style="font-size: 0.9375rem;">${t.reason}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">${formatDate(t.timestamp)}</div>
        </div>
        <span style="font-size: 1.15rem; font-weight: bold; color: ${color};">${prefix}${t.points} PTS</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px; font-style: italic;">TRANS-HISTORY</h2>
      
      <div id="txns-list">
        ${txnsHtml}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/rewards')}
  `;
}

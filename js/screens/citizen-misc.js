/**
 * Sahi Bin - Citizen Secondary Screens Module
 * Consolidates Sustainability, Raise Complaint, Complaint List, Complaint Details,
 * Penalties History, Profile, Edit Profile, Household Members, and Notifications.
 */

import { router } from '../router.js';
import { store } from '../state.js';
import { showToast, formatDate } from '../utils.js';
import { renderHeader } from '../../components/header.js';
import { renderBottomNav, CITIZEN_TABS } from '../../components/bottom-nav.js';
import { renderButton } from '../../components/button.js';
import { renderFormGroup } from '../../components/form-input.js';
import { renderBarChart } from '../../components/chart.js';
import { getComplaints, getComplaintById, createComplaint, getPenalties, appealPenalty, getNotifications, markAsRead, logout, getMonthlyStats } from '../firebase/db-service.js';

// ============================================================================
// 1. SUSTAINABILITY INSIGHTS
// ============================================================================

export async function renderSustainability(container) {
  const user = store.get('currentUser') || { householdId: 'hh_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING INSIGHTS...</p>
    </div>
  `;

  let stats = [];
  try {
    stats = await getMonthlyStats(user.householdId || 'hh_001');
  } catch (err) {
    console.warn(err);
  }

  if (stats.length === 0) {
    stats = [
      { month: 'Jan', total: 6.4, segregationRate: 82 },
      { month: 'Feb', total: 7.0, segregationRate: 85 },
      { month: 'Mar', total: 6.7, segregationRate: 88 },
      { month: 'Apr', total: 7.0, segregationRate: 90 },
      { month: 'May', total: 7.1, segregationRate: 86 },
      { month: 'Jun', total: 3.9, segregationRate: 87 }
    ];
  }

  const chartData = stats.map(s => ({
    label: s.month,
    value: s.segregationRate,
    color: 'var(--color-primary)'
  }));

  const headerHtml = renderHeader({
    title: 'SUSTAINABILITY',
    backButton: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px; display: flex; flex-direction: column; gap: 20px;">
      <h2 class="text-heading-sm" style="font-style: italic;">ENVIRONMENTAL IMPACT</h2>

      <!-- Stat boxes -->
      <div class="card-brutalist" style="background: white; padding: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: center;">
          <div>
            <div style="font-size: 2.2rem;">🌱</div>
            <div class="text-label" style="font-size: 0.75rem; margin-top: 4px;">CO2 REDUCED</div>
            <div class="text-heading-sm" style="font-size: 1.35rem; color: var(--color-primary);">42.8 KG</div>
          </div>
          <div>
            <div style="font-size: 2.2rem;">💧</div>
            <div class="text-label" style="font-size: 0.75rem; margin-top: 4px;">WATER SAVED</div>
            <div class="text-heading-sm" style="font-size: 1.35rem; color: var(--color-accent);">120 Liters</div>
          </div>
        </div>
      </div>

      <!-- Segregation rate chart -->
      <div class="card-brutalist" style="background: white; padding: 20px;">
        <h3 class="text-heading-sm" style="margin-bottom: 12px; font-size: 1rem;">SEGREGATION RATE TRENDS (%)</h3>
        ${renderBarChart(chartData, { height: 140, showLabels: true, showValues: true, maxValue: 100 })}
      </div>

      <!-- Insights tips -->
      <div class="card-brutalist" style="background: var(--color-warning-bg); padding: 16px;">
        <h4 class="text-label" style="margin-bottom: 6px;">💡 GREEN TIP OF THE DAY</h4>
        <p class="text-body-sm" style="margin: 0; color: var(--color-text);">Plastics bottles ko rinse/saf karke dry waste bin mein daalein. Geela kachra mixed na hone dein.</p>
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;
}

// ============================================================================
// 2. RAISE COMPLAINT
// ============================================================================

export function renderRaiseComplaint(container) {
  const headerHtml = renderHeader({
    title: 'NEW COMPLAINT',
    backButton: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">REMEDIAL SUPPORT / SHIKAYAT</h2>

      <form id="complaint-form-el" class="card-brutalist" style="background: white; padding: 20px; display: flex; flex-direction: column; gap: 16px;">
        
        ${renderFormGroup({
          id: 'cmp-category',
          label: 'CATEGORY (Shikayat ki shreni)',
          type: 'select',
          required: true,
          options: `
            <option value="missed_collection">Missed Collection (Kachra collect nahi hua)</option>
            <option value="wrong_classification">Wrong Classification (Galat waste categorization)</option>
            <option value="bin_damage">Bin Damage (Community dustbin kharab hai)</option>
            <option value="other">Other / Miscellaneous (Anya shikayat)</option>
          `
        })}

        ${renderFormGroup({
          id: 'cmp-desc',
          label: 'DESCRIPTION (Shikayat ka vivaran)',
          type: 'textarea',
          placeholder: 'Apni samasya ka details dalein...',
          required: true
        })}

        <!-- Capture Image simulation -->
        <div class="form-group">
          <label class="form-label">ATTACH PHOTO (Optional)</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button type="button" id="cmp-photo-btn" class="btn btn-outline" style="padding: 8px 12px;">📷 Take Photo</button>
            <span id="cmp-photo-status" style="font-size: 0.8125rem; color: var(--color-text-secondary);">No photo attached</span>
          </div>
        </div>

        ${renderButton('Submit Complaint', {
          variant: 'primary',
          block: true,
          type: 'submit',
          id: 'cmp-submit'
        })}
      </form>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;

  let attachedBlob = null;

  document.getElementById('cmp-photo-btn').addEventListener('click', () => {
    // Generate a simple dummy canvas image as mock attachment
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#bbb';
    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = '#000';
    ctx.fillText('CMP-PHOTO', 10, 50);

    canvas.toBlob((blob) => {
      attachedBlob = blob;
      document.getElementById('cmp-photo-status').innerText = 'Photo Attached ✓';
      document.getElementById('cmp-photo-status').style.color = 'var(--color-success)';
      showToast('Photo attached successfully!', 'success');
    }, 'image/jpeg');
  });

  const form = document.getElementById('complaint-form-el');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('cmp-category').value;
    const description = document.getElementById('cmp-desc').value;
    const user = store.get('currentUser') || { uid: 'cit_001' };

    const submitBtn = document.getElementById('cmp-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'SUBMITTING...';

    try {
      await createComplaint({
        userId: user.uid,
        category,
        description,
        imageUrl: attachedBlob ? URL.createObjectURL(attachedBlob) : null
      });
      showToast('Complaint submitted successfully!', 'success');
      router.navigate('#/citizen/complaints');
    } catch (err) {
      showToast('Submission error: ' + err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = 'SUBMIT COMPLAINT';
    }
  });
}

// ============================================================================
// 3. COMPLAINT HISTORY (LIST)
// ============================================================================

export async function renderComplaintHistory(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING COMPLAINTS...</p>
    </div>
  `;

  let list = [];
  try {
    list = await getComplaints(user.uid);
  } catch (err) {
    console.warn(err);
  }

  // Mocks
  if (list.length === 0) {
    list = [
      { id: 'cmp_001', category: 'missed_collection', description: 'Kachra gaadi aaj nahi aayi.', status: 'resolved', createdAt: new Date() },
      { id: 'cmp_002', category: 'bin_damage', description: 'Gully bin damage ho gaya hai.', status: 'pending', createdAt: new Date(Date.now() - 86400000) }
    ];
  }

  const headerHtml = renderHeader({
    title: 'COMPLAINTS LIST',
    backButton: true
  });

  const listHtml = list.map(c => {
    const statusText = c.status === 'resolved' ? 'RESOLVED' : (c.status === 'in_progress' ? 'IN PROGRESS' : 'PENDING');
    const badgeClass = c.status === 'resolved' ? 'badge--success' : (c.status === 'in_progress' ? 'badge--info' : 'badge--warning');
    
    return `
      <div class="card-brutalist cmp-item" data-id="${c.id}" style="background: white; padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="text-label" style="text-transform: uppercase;">${c.category.replace('_', ' ')}</span>
          <span class="badge ${badgeClass}">${statusText}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${c.description}</p>
        <span style="font-size: 0.75rem; color: var(--color-text-secondary);">${formatDate(c.createdAt)}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 class="text-heading-sm">APNI SHIKAYATEN</h2>
        <a href="#/citizen/complaint/new" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8125rem;">+ New</a>
      </div>

      <div id="complaints-list-container">
        ${listHtml || '<p style="text-align: center; color: var(--color-text-muted);">Koi shikayat nahi mili.</p>'}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;

  // Listener
  const items = container.querySelectorAll('.cmp-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      router.navigate(`#/citizen/complaint/${id}`);
    });
  });
}

// ============================================================================
// 4. COMPLAINT DETAILS
// ============================================================================

export async function renderComplaintDetails(container, params) {
  const cmpId = params.id;
  
  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING DETAILS...</p>
    </div>
  `;

  let cmp = null;
  try {
    cmp = await getComplaintById(cmpId);
  } catch (err) {
    console.warn(err);
  }

  if (!cmp) {
    cmp = {
      id: cmpId,
      category: 'missed_collection',
      description: 'Kachra gaadi aaj nahi aayi. Sector 4 block B main gate lane.',
      status: 'resolved',
      createdAt: new Date(),
      resolution: 'Safai Mitra Suresh Yadav ko route update karke bheja gaya. Collection ho chuka hai.',
      imageUrl: null
    };
  }

  const headerHtml = renderHeader({
    title: 'COMPLAINT DETAIL',
    backButton: true
  });

  const statusBadge = cmp.status === 'resolved' ? 'badge--success' : 'badge--warning';

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      
      <div class="card-brutalist" style="background: white; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="text-caption">${cmp.category.toUpperCase()}</span>
          <span class="badge ${statusBadge}">${cmp.status.toUpperCase()}</span>
        </div>
        
        <h3 class="text-heading-sm" style="margin-bottom: 8px;">Date Filed: ${formatDate(cmp.createdAt)}</h3>
        <p class="text-body" style="margin-bottom: 16px;">${cmp.description}</p>
        
        ${cmp.resolution ? `
          <div class="divider"></div>
          <div style="background: var(--color-success-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--color-success);">
            <div class="text-label" style="color: #2E7D32; margin-bottom: 4px;">RESOLUTION NOTE:</div>
            <p style="margin: 0; font-size: 0.875rem; color: #1B5E20;">${cmp.resolution}</p>
          </div>
        ` : ''}
      </div>

      <button id="cmp-back-btn" class="btn btn-outline btn-block">Back to Complaints</button>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;

  document.getElementById('cmp-back-btn').addEventListener('click', () => {
    router.navigate('#/citizen/complaints');
  });
}

// ============================================================================
// 5. PENALTY HISTORY
// ============================================================================

export async function renderPenaltyHistory(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING PENALTIES...</p>
    </div>
  `;

  let penalties = [];
  try {
    penalties = await getPenalties(user.uid);
  } catch (err) {
    console.warn(err);
  }

  if (penalties.length === 0) {
    penalties = [
      { id: 'pen_001', reason: 'Lagatar 3 baar mixed waste diya', severity: 'medium', status: 'active', amount: 50, createdAt: new Date() }
    ];
  }

  const headerHtml = renderHeader({
    title: 'PENALTY HISTORY',
    backButton: true
  });

  const listHtml = penalties.map(p => {
    const statusText = p.status === 'paid' ? 'PAID' : 'UNPAID / ACTIVE';
    const badge = p.status === 'paid' ? 'badge--success' : 'badge--danger';
    
    return `
      <div class="card-brutalist" style="background: white; padding: 16px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="text-label" style="color: var(--color-danger); text-transform: uppercase;">⚠️ PENALTY ISSUED</span>
          <span class="badge ${badge}">${statusText}</span>
        </div>
        <p style="font-size: 0.875rem; margin: 0; font-weight: bold;">Reason: ${p.reason}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 0.8125rem; color: var(--color-text-secondary);">${formatDate(p.createdAt)}</span>
          <span class="text-heading-sm" style="color: var(--color-danger); font-size: 1.15rem;">₹${p.amount}</span>
        </div>
        ${p.status !== 'paid' ? `<button class="btn btn-outline btn-block appeal-btn" data-id="${p.id}" style="margin-top: 8px; font-size: 0.75rem; padding: 6px;">Appeal Penalty (Apatti jataein)</button>` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px; font-style: italic;">DAND & PENALTIES (ZURMANA)</h2>
      
      <div id="penalties-list">
        ${listHtml || '<p style="text-align: center; color: var(--color-text-muted);">Aapke account par koi penalty nahi hai. Bahut badhiya! 👍</p>'}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;

  const appealBtns = container.querySelectorAll('.appeal-btn');
  appealBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Kya aap is penalty ke khilaf appeal raise karna chahte hain?')) {
        try {
          await appealPenalty(id);
          showToast('Appeal registered successfully! Review pending.', 'success');
          btn.disabled = true;
          btn.innerText = 'Appeal Under Review';
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });
}

// ============================================================================
// 6. CITIZEN PROFILE & MANAGEMENT
// ============================================================================

export function renderCitizenProfile(container) {
  const user = store.get('currentUser') || { name: 'Citizen', email: 'citizen@example.com', phone: '+91 98765 43210', address: '42, Sector 4' };

  const headerHtml = renderHeader({
    title: 'PROFILE',
    showMenu: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Profile display -->
      <div class="card-brutalist" style="background: white; padding: 20px; display: flex; align-items: center; gap: 16px;">
        <div class="avatar avatar--lg">RK</div>
        <div>
          <h2 class="text-heading-sm" style="font-size: 1.3rem; margin: 0;">${user.name}</h2>
          <p style="font-size: 0.8125rem; color: var(--color-text-secondary);">${user.email}</p>
        </div>
      </div>

      <!-- Address / Phone details -->
      <div class="card-brutalist" style="background: white; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
        <div>
          <span class="text-caption">MOBILE</span>
          <div class="text-label" style="font-size: 1.05rem;">${user.phone}</div>
        </div>
        <div class="divider" style="margin: 0;"></div>
        <div>
          <span class="text-caption">GHAR KA PATA (Address)</span>
          <div class="text-label" style="font-size: 1.05rem;">${user.address}</div>
        </div>
      </div>

      <!-- Settings / Links -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a href="#/citizen/profile/edit" class="btn btn-outline btn-block" style="text-align: center; justify-content: center; font-weight: bold;">Edit Profile ⚙️</a>
        <a href="#/citizen/household" class="btn btn-outline btn-block" style="text-align: center; justify-content: center; font-weight: bold;">Household Members 👥</a>
        <a href="#/citizen/penalties" class="btn btn-outline btn-block" style="text-align: center; justify-content: center; font-weight: bold; color: var(--color-danger); border-color: var(--color-danger-light);">Penalty History ⚠️</a>
      </div>

      <button id="citizen-logout-btn" class="btn btn-danger btn-block" style="box-shadow: 4px 4px 0 #1A1A1A;">LOGOUT (Exit)</button>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/profile')}
  `;

  document.getElementById('citizen-logout-btn').addEventListener('click', async () => {
    if (confirm('Kya aap logout karna chahte hain?')) {
      try {
        await logout();
        store.clear();
        router.navigate('#/');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}

// ============================================================================
// 7. EDIT PROFILE
// ============================================================================

export function renderEditProfile(container) {
  const user = store.get('currentUser') || { name: 'Citizen', phone: '9876543210', address: '42, Sector 4' };

  const headerHtml = renderHeader({
    title: 'EDIT PROFILE',
    backButton: true
  });

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">EDIT DETAILS</h2>

      <form id="edit-profile-form-el" class="card-brutalist" style="background: white; padding: 20px; display: flex; flex-direction: column; gap: 16px;">
        ${renderFormGroup({
          id: 'edit-name',
          label: 'NAME (Naam)',
          type: 'text',
          value: user.name,
          required: true
        })}

        ${renderFormGroup({
          id: 'edit-phone',
          label: 'PHONE NUMBER',
          type: 'tel',
          value: user.phone.replace('+91 ', ''),
          required: true
        })}

        ${renderFormGroup({
          id: 'edit-address',
          label: 'ADDRESS (Pata)',
          type: 'text',
          value: user.address,
          required: true
        })}

        ${renderButton('Save Changes', {
          variant: 'primary',
          block: true,
          type: 'submit',
          id: 'edit-save'
        })}
      </form>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/profile')}
  `;

  document.getElementById('edit-profile-form-el').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const address = document.getElementById('edit-address').value;

    const current = store.get('currentUser') || {};
    store.set('currentUser', {
      ...current,
      name,
      phone: '+91 ' + phone,
      address
    });

    showToast('Profile updated successfully!', 'success');
    router.navigate('#/citizen/profile');
  });
}

// ============================================================================
// 8. HOUSEHOLD MEMBERS
// ============================================================================

export function renderHouseholdMembers(container) {
  const headerHtml = renderHeader({
    title: 'MEMBERS',
    backButton: true
  });

  const members = [
    { name: 'Ramesh Kumar', phone: '+91 98765 43210', role: 'Primary' },
    { name: 'Sunita Kumar', phone: '+91 98765 43211', role: 'Member' }
  ];

  const membersHtml = members.map(m => `
    <div class="card-brutalist card-brutalist--flat" style="background: white; padding: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <div>
        <div class="text-label">${m.name}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${m.phone}</div>
      </div>
      <span class="badge badge--info">${m.role}</span>
    </div>
  `).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">PARIVAR KE SADASYA</h2>
      
      <div style="margin-bottom: 24px;">
        ${membersHtml}
      </div>

      <!-- Add member button -->
      <button id="add-member-btn" class="btn btn-primary btn-block">Add New Member 👥</button>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/profile')}
  `;

  document.getElementById('add-member-btn').addEventListener('click', () => {
    const name = prompt('Sadasya ka naam (Name):');
    if (!name) return;
    const phone = prompt('Sadasya ka phone number:');
    if (!phone) return;
    showToast('Member added! Syncing...', 'success');
    // Reload page to reflect updates
    router.navigate('#/citizen/profile');
  });
}

// ============================================================================
// 9. CITIZEN NOTIFICATIONS
// ============================================================================

export async function renderCitizenNotifications(container) {
  const user = store.get('currentUser') || { uid: 'cit_001' };

  container.innerHTML = `
    <div class="screen" style="padding: 24px; text-align: center;">
      <p class="text-heading-md">LOADING NOTIFICATIONS...</p>
    </div>
  `;

  let notifs = [];
  try {
    notifs = await getNotifications(user.uid);
  } catch (err) {
    console.warn(err);
  }

  if (notifs.length === 0) {
    notifs = [
      { id: 'cn_001', title: '🥬 Waste Collection Completed', body: 'Aaj ka waste successfully collect aur verify ho gaya.', read: false, createdAt: new Date() },
      { id: 'cn_002', title: '🎉 +20 Points Credited', body: 'Sahi segregation ke liye rewards aapke account mein credit ho gaye hain.', read: false, createdAt: new Date() },
      { id: 'cn_003', title: '📢 Safai Drive Sunday', body: 'Nagar nigam dwara Sector 4 mein vishesh safai abhiyan chalaya jayega.', read: true, createdAt: new Date(Date.now() - 86400000) }
    ];
  }

  const headerHtml = renderHeader({
    title: 'NOTIFICATIONS',
    backButton: true
  });

  const listHtml = notifs.map(n => {
    const unreadStyle = !n.read ? 'border-left: 6px solid var(--color-primary);' : '';
    return `
      <div class="card-brutalist notif-item" data-id="${n.id}" style="background: white; padding: 14px; margin-bottom: 12px; cursor: pointer; ${unreadStyle} display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9375rem;">
          <span>${n.title}</span>
          <span style="font-size: 0.75rem; color: var(--color-text-secondary);">${formatDate(n.createdAt)}</span>
        </div>
        <p style="margin: 0; font-size: 0.8125rem; color: var(--color-text-secondary);">${n.body}</p>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHtml}
    
    <div class="screen" style="padding: 20px; padding-top: 80px; padding-bottom: 80px;">
      <h2 class="text-heading-sm" style="margin-bottom: 16px;">SOOCHANAEN (Notifications)</h2>
      
      <div id="c-notifs-list">
        ${listHtml}
      </div>
    </div>
    ${renderBottomNav(CITIZEN_TABS, '#/citizen/dashboard')}
  `;

  // Attach mark read listeners
  const items = container.querySelectorAll('.notif-item');
  items.forEach(item => {
    item.addEventListener('click', async () => {
      const id = item.getAttribute('data-id');
      try {
        await markAsRead(id);
        item.style.borderLeft = 'none';
        showToast('Notification read', 'info');
      } catch (err) {
        console.warn(err);
      }
    });
  });
}

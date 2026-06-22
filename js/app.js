/**
 * Sahi Bin - SPA Main Application Entry Point
 * Initializes services, registers hash-based routes, and manages global auth changes.
 */

import { router } from './router.js';
import { store } from './state.js';
import { initFirebase } from './firebase/init.js';
import { onAuthChanged } from './firebase/auth-service.js';
import { initNetworkStatus } from './offline/network-status.js';
import { initSyncManager } from './offline/sync-manager.js';

// Auth Screen Renders
import {
  renderRoleSelect,
  renderLogin,
  renderRegister,
  renderOTP,
  renderForgotPassword
} from './screens/auth.js';

// Worker Screen Renders
import {
  renderWorkerDashboard,
  renderAssignedRoute,
  renderHouseQueue,
  renderQRScan,
  renderHouseholdDetails,
  renderWasteCapture,
  renderAIProcessing,
  renderWasteResult,
  renderCollectionSuccess
} from './screens/worker-core.js';

import {
  renderWorkerHistory,
  renderWorkerCollectionDetails,
  renderPerformance,
  renderMonthlyPerformance,
  renderLeaderboard,
  renderWorkerProfile,
  renderWorkerNotifications
} from './screens/worker-misc.js';

// Citizen Screen Renders
import {
  renderCitizenDashboard,
  renderCitizenHistory,
  renderCitizenCollectionDetails,
  renderCollectionCalendar,
  renderSegregationTimeline
} from './screens/citizen-core.js';

import {
  renderRewardsDashboard,
  renderRewardStore,
  renderRewardSuccess,
  renderRewardHistory
} from './screens/citizen-rewards.js';

import {
  renderSustainability,
  renderRaiseComplaint,
  renderComplaintHistory,
  renderComplaintDetails,
  renderPenaltyHistory,
  renderCitizenProfile,
  renderEditProfile,
  renderHouseholdMembers,
  renderCitizenNotifications
} from './screens/citizen-misc.js';

/**
 * Main application initialization sequence.
 */
async function initApp() {
  console.log('[App] Initializing Sahi Bin PWA...');

  // 1. Restore local session states
  store.restore();

  // 2. Connect and initialize Firebase Services
  await initFirebase();

  // 3. Start offline queue sync monitor
  await initSyncManager();

  // 4. Hook window-level network listeners (online/offline)
  initNetworkStatus();

  // 5. Register all route pathways
  registerRoutes();

  // 6. Listen to Firebase auth changes to update navigation states
  onAuthChanged((user) => {
    if (user) {
      store.set('currentUser', user);
      
      // Determine redirection route based on authenticated role
      const currentHash = window.location.hash;
      const isWorkerRoute = currentHash.startsWith('#/worker');
      const isCitizenRoute = currentHash.startsWith('#/citizen');
      
      if (user.role === 'worker' && !isWorkerRoute) {
        router.navigate('#/worker/dashboard');
      } else if (user.role === 'citizen' && !isCitizenRoute) {
        router.navigate('#/citizen/dashboard');
      }
    } else {
      store.clear();
      // Redirect guest to role selection page if on a guarded page
      const currentHash = window.location.hash;
      if (currentHash.includes('/worker') || currentHash.includes('/citizen')) {
        router.navigate('#/');
      }
    }
  });

  // 7. Fire up hash router engine
  router.init('app');

  // 8. Hide the splash screen loader
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 400); // matching transition duration in index.html styles
  }
}

/**
 * Registers SPA route hashes.
 */
function registerRoutes() {
  // Guest / Auth routes
  router.addRoute('#/', renderRoleSelect, { guard: 'guest', title: 'Sahi Bin - Kaun Hain Aap?' });
  router.addRoute('#/login/:role', renderLogin, { guard: 'guest', title: 'Sahi Bin - Login' });
  router.addRoute('#/register', renderRegister, { guard: 'guest', title: 'Sahi Bin - Citizen Register' });
  router.addRoute('#/otp', renderOTP, { guard: 'guest', title: 'Sahi Bin - Verification' });
  router.addRoute('#/forgot-password', renderForgotPassword, { guard: 'guest', title: 'Sahi Bin - Reset Password' });

  // Worker routes
  router.addRoute('#/worker/dashboard', renderWorkerDashboard, { guard: 'auth', role: 'worker', title: 'Worker - Dashboard' });
  router.addRoute('#/worker/route', renderAssignedRoute, { guard: 'auth', role: 'worker', title: 'Worker - Assigned Route' });
  router.addRoute('#/worker/queue', renderHouseQueue, { guard: 'auth', role: 'worker', title: 'Worker - Queue List' });
  router.addRoute('#/worker/scan', renderQRScan, { guard: 'auth', role: 'worker', title: 'Worker - Scan QR' });
  router.addRoute('#/worker/household/:id', renderHouseholdDetails, { guard: 'auth', role: 'worker', title: 'Worker - Household Verification' });
  router.addRoute('#/worker/capture', renderWasteCapture, { guard: 'auth', role: 'worker', title: 'Worker - Capture Waste' });
  router.addRoute('#/worker/processing', renderAIProcessing, { guard: 'auth', role: 'worker', title: 'Worker - Analyzing...' });
  router.addRoute('#/worker/result', renderWasteResult, { guard: 'auth', role: 'worker', title: 'Worker - Classification Result' });
  router.addRoute('#/worker/success', renderCollectionSuccess, { guard: 'auth', role: 'worker', title: 'Worker - Collection Success' });
  router.addRoute('#/worker/history', renderWorkerHistory, { guard: 'auth', role: 'worker', title: 'Worker - Collection History' });
  router.addRoute('#/worker/history/:id', renderWorkerCollectionDetails, { guard: 'auth', role: 'worker', title: 'Worker - Collection Details' });
  router.addRoute('#/worker/performance', renderPerformance, { guard: 'auth', role: 'worker', title: 'Worker - Performance' });
  router.addRoute('#/worker/performance/monthly', renderMonthlyPerformance, { guard: 'auth', role: 'worker', title: 'Worker - Monthly Stats' });
  router.addRoute('#/worker/leaderboard', renderLeaderboard, { guard: 'auth', role: 'worker', title: 'Worker - Leaderboard' });
  router.addRoute('#/worker/profile', renderWorkerProfile, { guard: 'auth', role: 'worker', title: 'Worker - Profile' });
  router.addRoute('#/worker/notifications', renderWorkerNotifications, { guard: 'auth', role: 'worker', title: 'Worker - Notifications' });

  // Citizen routes
  router.addRoute('#/citizen/dashboard', renderCitizenDashboard, { guard: 'auth', role: 'citizen', title: 'Citizen - Dashboard' });
  router.addRoute('#/citizen/history', renderCitizenHistory, { guard: 'auth', role: 'citizen', title: 'Citizen - History' });
  router.addRoute('#/citizen/history/:id', renderCitizenCollectionDetails, { guard: 'auth', role: 'citizen', title: 'Citizen - Details' });
  router.addRoute('#/citizen/calendar', renderCollectionCalendar, { guard: 'auth', role: 'citizen', title: 'Citizen - Calendar' });
  router.addRoute('#/citizen/timeline', renderSegregationTimeline, { guard: 'auth', role: 'citizen', title: 'Citizen - Score Timeline' });
  router.addRoute('#/citizen/rewards', renderRewardsDashboard, { guard: 'auth', role: 'citizen', title: 'Citizen - Rewards' });
  router.addRoute('#/citizen/rewards/store', renderRewardStore, { guard: 'auth', role: 'citizen', title: 'Citizen - Reward Store' });
  router.addRoute('#/citizen/rewards/success', renderRewardSuccess, { guard: 'auth', role: 'citizen', title: 'Citizen - Redemption Success' });
  router.addRoute('#/citizen/rewards/history', renderRewardHistory, { guard: 'auth', role: 'citizen', title: 'Citizen - Reward History' });
  router.addRoute('#/citizen/sustainability', renderSustainability, { guard: 'auth', role: 'citizen', title: 'Citizen - Insights' });
  router.addRoute('#/citizen/complaint/new', renderRaiseComplaint, { guard: 'auth', role: 'citizen', title: 'Citizen - File Complaint' });
  router.addRoute('#/citizen/complaints', renderComplaintHistory, { guard: 'auth', role: 'citizen', title: 'Citizen - Complaints List' });
  router.addRoute('#/citizen/complaint/:id', renderComplaintDetails, { guard: 'auth', role: 'citizen', title: 'Citizen - Complaint Details' });
  router.addRoute('#/citizen/penalties', renderPenaltyHistory, { guard: 'auth', role: 'citizen', title: 'Citizen - Zurmana/Penalties' });
  router.addRoute('#/citizen/profile', renderCitizenProfile, { guard: 'auth', role: 'citizen', title: 'Citizen - Profile' });
  router.addRoute('#/citizen/profile/edit', renderEditProfile, { guard: 'auth', role: 'citizen', title: 'Citizen - Edit Profile' });
  router.addRoute('#/citizen/household', renderHouseholdMembers, { guard: 'auth', role: 'citizen', title: 'Citizen - Household' });
  router.addRoute('#/citizen/notifications', renderCitizenNotifications, { guard: 'auth', role: 'citizen', title: 'Citizen - Notifications' });
}

// Bootstrapper on DOM content load
document.addEventListener('DOMContentLoaded', initApp);

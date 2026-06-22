/**
 * Sahi Bin - Network Status Monitor
 * Detects online/offline states and triggers background sync.
 */

import { store } from '../state.js';
import { triggerSync } from './sync-manager.js';
import { showToast } from '../utils.js';

/**
 * Initialize network monitoring listeners.
 */
export function initNetworkStatus() {
  const updateStatus = () => {
    const isOnline = navigator.onLine;
    const status = isOnline ? 'online' : 'offline';
    
    // Store current state
    const prevStatus = store.get('networkStatus');
    store.set('networkStatus', status);
    
    // Update network banner DOM (if it exists)
    const banner = document.getElementById('network-banner');
    if (banner) {
      if (!isOnline) {
        banner.innerHTML = `<div class="info-bar" style="background-color: var(--color-warning-bg); border-color: var(--color-warning); text-align: center; width: 100%;">
          📡 Offline Mode — Data save hoga, baad mein sync hoga
        </div>`;
        banner.style.display = 'block';
        showToast('Aap offline hain. Data locally save hoga.', 'warning');
      } else {
        if (prevStatus === 'offline') {
          banner.innerHTML = `<div class="info-bar" style="background-color: var(--color-success-bg); border-color: var(--color-success); text-align: center; width: 100%;">
            ✓ Aap online hain! Data sync ho raha hai...
          </div>`;
          banner.style.display = 'block';
          showToast('Aap online aa gaye hain! Sync suru ho raha hai.', 'success');
          
          // Trigger the sync manager to process queue
          triggerSync();
          
          // Hide banner after 3 seconds
          setTimeout(() => {
            if (store.get('networkStatus') === 'online') {
              banner.style.display = 'none';
            }
          }, 3000);
        } else {
          banner.style.display = 'none';
        }
      }
    }
  };

  // Initial check
  updateStatus();

  // Listeners
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
}

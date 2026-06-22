/**
 * Sahi Bin - Offline Background Sync Manager
 * Synchronizes queued offline waste logs, image uploads, and media.
 */

import { store } from '../state.js';
import { dequeue, count, openDB } from './offline-queue.js';
import { createWasteLog, createRewardTransaction, createNotification, getOrCreateDailyPerformance, updatePerformanceMetrics } from '../firebase/db-service.js';
import { createMedia } from '../firebase/storage-service.js';
import { showToast } from '../utils.js';

let syncActive = false;

/**
 * Initialize background sync manager.
 */
export async function initSyncManager() {
  // Update the store with current queue count
  await updateQueueCount();
  
  // Check if we are online and sync is needed
  if (navigator.onLine) {
    triggerSync();
  }
}

/**
 * Update the offline queue count in the state store.
 */
export async function updateQueueCount() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['pending_logs'], 'readonly');
    const storeObj = transaction.objectStore('pending_logs');
    
    return new Promise((resolve) => {
      const request = storeObj.count();
      request.onsuccess = () => {
        const c = request.result;
        store.set('offlineQueueCount', c);
        resolve(c);
      };
      request.onerror = () => {
        resolve(0);
      };
    });
  } catch (err) {
    console.warn('[Sync] Failed to count queue:', err);
    return 0;
  }
}

/**
 * Triggers the sync queue processing if not already syncing.
 */
export function triggerSync() {
  if (syncActive) return;
  processQueue().catch(err => {
    console.error('[Sync] Process queue error:', err);
    syncActive = false;
    store.set('syncInProgress', false);
  });
}

/**
 * Main queue processing loop (FIFO).
 */
async function processQueue() {
  if (!navigator.onLine) return;
  
  const logCount = await updateQueueCount();
  if (logCount === 0) return;
  
  syncActive = true;
  store.set('syncInProgress', true);
  
  // Renders updating status in network banner if exists
  const banner = document.getElementById('network-banner');
  if (banner) {
    banner.innerHTML = `<div class="info-bar" style="background-color: var(--color-accent-light); border-color: var(--color-accent); text-align: center; width: 100%;">
      ⟳ ${logCount} items sync ho rahe hain...
    </div>`;
    banner.style.display = 'block';
  }
  
  let currentLog = await dequeue('pending_logs');
  
  while (currentLog) {
    try {
      await syncSingleLog(currentLog);
    } catch (err) {
      console.error('[Sync] Failed to sync log:', currentLog, err);
      // Wait before retrying (exponential backoff / retry limit should be implemented here)
      showToast('Kachra sync fail hua. Retrying...', 'error');
      // Re-enqueue at the end of the queue to prevent blocking
      const db = await openDB();
      const transaction = db.transaction(['pending_logs'], 'readwrite');
      transaction.objectStore('pending_logs').add(currentLog);
      break;
    }
    
    await updateQueueCount();
    currentLog = await dequeue('pending_logs');
  }
  
  syncActive = false;
  store.set('syncInProgress', false);
  
  const finalCount = await updateQueueCount();
  if (finalCount === 0 && banner) {
    banner.innerHTML = `<div class="info-bar" style="background-color: var(--color-success-bg); border-color: var(--color-success); text-align: center; width: 100%;">
      ✓ Sab sync ho gaya!
    </div>`;
    showToast('Sabhi records sync ho gaye hain.', 'success');
    setTimeout(() => {
      if (store.get('networkStatus') === 'online' && !syncActive) {
        banner.style.display = 'none';
      }
    }, 3000);
  }
}

/**
 * Sync a single waste log, including its image blob.
 * @param {Object} item 
 */
async function syncSingleLog(item) {
  const { logData, imageBlob } = item;
  
  let mediaId = null;
  let imageUrl = null;
  
  // 1. Upload image if present
  if (imageBlob) {
    const res = await createMedia(
      'waste_image',
      logData.workerId,
      'waste_logs',
      'temp_id', // Updated later or kept as is
      imageBlob
    );
    mediaId = res.mediaId;
    imageUrl = res.url;
  }
  
  // 2. Prepare log data
  const finalLogData = {
    ...logData,
    mediaId,
    imageUrl,
    synced: true,
    syncedAt: new Date()
  };
  
  // 3. Write waste log to Firestore
  const logId = await createWasteLog(finalLogData);
  
  // 4. Create reward/penalty transactions
  const isSegregated = logData.isSegregated;
  const points = isSegregated ? 20 : -10;
  const reason = isSegregated ? 'Sahi segregation ke liye rewards' : 'Improper waste segregation penalty';
  const type = isSegregated ? 'credit' : 'debit';
  
  await createRewardTransaction({
    userId: logData.citizenId,
    points,
    reason,
    type
  });
  
  // 5. Notify citizen
  await createNotification({
    userId: logData.citizenId,
    category: isSegregated ? 'reward' : 'penalty',
    title: isSegregated ? 'Kachra Segregation Completed' : '⚠️ Mixed Waste Alert',
    body: isSegregated 
      ? `Aapke ghar se geela/sookha kachra sahi tareeke se collect kiya gaya. +20 points add ho gaye.`
      : `Warning: Aapne mixed kachra diya. Sahi segregation karein. -10 points penalty.`,
    read: false
  });
  
  // 6. Update worker performance metrics
  try {
    const dailyPerf = await getOrCreateDailyPerformance(logData.workerId);
    const completedStops = (dailyPerf.completedStops || 0) + 1;
    const wetInc = logData.wasteType === 'wet' ? logData.weightKg : 0;
    const dryInc = logData.wasteType === 'dry' ? logData.weightKg : 0;
    const mixedInc = logData.wasteType === 'mixed' ? logData.weightKg : 0;
    
    // Calculate new segregation rate
    // Segregation Rate = (Wet + Dry) / Total
    const currentWet = (dailyPerf.wetWasteCollectedKg || 0) + wetInc;
    const currentDry = (dailyPerf.dryWasteCollectedKg || 0) + dryInc;
    const currentMixed = (dailyPerf.mixedWasteCollectedKg || 0) + mixedInc;
    const totalWaste = currentWet + currentDry + currentMixed;
    const newSegRate = totalWaste > 0 ? Math.round(((currentWet + currentDry) / totalWaste) * 100) : 100;
    
    await updatePerformanceMetrics(dailyPerf.id, {
      completedStops,
      wetWasteCollectedKg: currentWet,
      dryWasteCollectedKg: currentDry,
      mixedWasteCollectedKg: currentMixed,
      segregationRate: newSegRate
    });
  } catch (err) {
    console.warn('[Sync] Failed to update daily performance metrics:', err);
  }
}

/**
 * Sahi Bin - GPS Verification Service
 * Verifies worker proximity to households using Geolocation API and Haversine formula.
 */

import { store } from '../state.js';

/**
 * Request Geolocation API permission and status check.
 * @returns {Promise<'available'|'denied'|'unavailable'>}
 */
export async function requestPermission() {
  if (!navigator.geolocation) {
    store.set('gpsStatus', 'unavailable');
    return 'unavailable';
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        store.set('gpsStatus', 'available');
        resolve('available');
      },
      (error) => {
        let status = 'unavailable';
        if (error.code === error.PERMISSION_DENIED) {
          status = 'denied';
        }
        store.set('gpsStatus', status);
        resolve(status);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

/**
 * Get current coordinates of the device.
 * @returns {Promise<{lat: number, lng: number, accuracy: number} | null>}
 */
export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.warn('[GPS] Failed to retrieve location:', error.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Verify proximity between worker and household using Haversine formula.
 * @param {number} workerLat 
 * @param {number} workerLng 
 * @param {number} householdLat 
 * @param {number} householdLng 
 * @param {number} radiusMeters - Proximity threshold in meters (default 100m)
 * @returns {boolean} True if within proximity
 */
export function verifyProximity(workerLat, workerLng, householdLat, householdLng, radiusMeters = 100) {
  if (!workerLat || !workerLng || !householdLat || !householdLng) {
    return false;
  }
  
  const R = 6371e3; // Earth radius in meters
  const phi1 = (workerLat * Math.PI) / 180;
  const phi2 = (householdLat * Math.PI) / 180;
  const deltaPhi = ((householdLat - workerLat) * Math.PI) / 180;
  const deltaLambda = ((householdLng - workerLng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  
  console.log(`[GPS Proximity] Distance: ${distance.toFixed(1)}m. Threshold: ${radiusMeters}m`);
  
  return distance <= radiusMeters;
}

/**
 * Standard collection verification logic:
 * Try GPS verification → Fallback to QR verification if GPS fails/denied → Fallback to manual override
 * @param {Object} householdLocation - { lat, lng } GeoPoint representation
 * @returns {Promise<{verified: boolean, method: 'gps'|'qr'|'manual'}>}
 */
export async function getVerificationResult(householdLocation) {
  // 1. Try GPS Verification
  const gpsPermission = await requestPermission();
  if (gpsPermission === 'available' && householdLocation) {
    const coords = await getCurrentPosition();
    if (coords) {
      const isClose = verifyProximity(
        coords.lat,
        coords.lng,
        householdLocation.lat,
        householdLocation.lng
      );
      if (isClose) {
        return { verified: true, method: 'gps' };
      }
    }
  }
  
  // 2. Fallback to QR verification
  // (In worker flow, if GPS fails, we assume they scan the QR code to confirm presence)
  const hasScannedQR = store.get('currentSession')?.householdId !== null;
  if (hasScannedQR) {
    return { verified: true, method: 'qr' };
  }
  
  // 3. Manual override fallback (requires manual worker confirmation in UI)
  return { verified: false, method: 'manual' };
}

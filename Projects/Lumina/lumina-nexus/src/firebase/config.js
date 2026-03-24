import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase is initialized lazily using config stored in localStorage
 * (set via the Configuration Panel). This means the app boots without
 * hard-coded credentials and users bring their own Firebase project.
 */

let _app = null;
let _auth = null;
let _db = null;

export function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem('nexus_firebase_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function initFirebase(config) {
  if (_app) return { app: _app, auth: _auth, db: _db };
  if (!config?.apiKey || !config?.projectId) return null;

  _app = getApps().length ? getApps()[0] : initializeApp(config);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  return { app: _app, auth: _auth, db: _db };
}

export function getFirebaseInstances() {
  if (_app) return { app: _app, auth: _auth, db: _db };
  const config = getFirebaseConfig();
  if (!config) return null;
  return initFirebase(config);
}

export function isFirebaseReady() {
  return !!_app || !!getFirebaseConfig()?.apiKey;
}

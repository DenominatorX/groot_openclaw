/**
 * Firebase Auth helpers — Anonymous + Google sign-in.
 */

import {
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as fbSignOut,
} from 'firebase/auth';
import { getFirebaseInstances, initFirebase, getFirebaseConfig } from './config';

function auth() {
  let inst = getFirebaseInstances();
  if (!inst) {
    const config = getFirebaseConfig();
    if (config) inst = initFirebase(config);
  }
  if (!inst?.auth) throw new Error('Firebase Auth not initialized');
  return inst.auth;
}

export function onAuthChange(callback) {
  try {
    return onAuthStateChanged(auth(), callback);
  } catch {
    return () => {};
  }
}

export async function signInAnon() {
  const result = await signInAnonymously(auth());
  return result.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth(), provider);
  return result.user;
}

export async function signOut() {
  await fbSignOut(auth());
}

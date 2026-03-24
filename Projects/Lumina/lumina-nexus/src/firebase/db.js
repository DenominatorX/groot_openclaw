/**
 * Firestore helpers for LuminaNexus.
 *
 * Collections (all scoped to the authenticated user's UID):
 *   users/{uid}/userResearch/{personId}   — notes & verified branches
 *   users/{uid}/aiCache/{personId}        — cached AI biographies
 *   users/{uid}/backlog/{itemId}          — in-app backlog items
 *   users/{uid}/settings/preferences     — user preferences doc
 *
 * Security model: server-side rules enforce users/{uid}/... access.
 * Client helpers here never expose other users' data.
 */

import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseInstances } from './config';

function uid() {
  const inst = getFirebaseInstances();
  const user = inst?.auth?.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

function db() {
  const inst = getFirebaseInstances();
  if (!inst?.db) throw new Error('Firestore not initialized');
  return inst.db;
}

// ── AI Biography Cache ──────────────────────────────────────────────────────

export async function getCachedBio(personId) {
  try {
    const ref = doc(db(), 'users', uid(), 'aiCache', personId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function setCachedBio(personId, bioData) {
  try {
    const ref = doc(db(), 'users', uid(), 'aiCache', personId);
    await setDoc(ref, { ...bioData, cachedAt: serverTimestamp() });
  } catch (err) {
    console.warn('Failed to cache bio:', err.message);
  }
}

// ── User Research (notes + verified scores) ─────────────────────────────────

export async function getUserResearch(personId) {
  try {
    const ref = doc(db(), 'users', uid(), 'userResearch', personId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function saveUserResearch(personId, data) {
  try {
    const ref = doc(db(), 'users', uid(), 'userResearch', personId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Failed to save research:', err.message);
  }
}

// ── Backlog ─────────────────────────────────────────────────────────────────

export async function getBacklogItems() {
  try {
    const colRef = collection(db(), 'users', uid(), 'backlog');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function addBacklogItem(item) {
  const colRef = collection(db(), 'users', uid(), 'backlog');
  const docRef = await addDoc(colRef, { ...item, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function updateBacklogItem(itemId, updates) {
  const ref = doc(db(), 'users', uid(), 'backlog', itemId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteBacklogItem(itemId) {
  const ref = doc(db(), 'users', uid(), 'backlog', itemId);
  await deleteDoc(ref);
}

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, userPath } from '../services/firebase';
import { INITIAL_LIBRARY, BADGES } from '../utils/constants';

const LOCAL_KEY = 'lumina_user_data';

function getLocalData() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
  } catch {
    return {};
  }
}

function setLocalData(key, value) {
  const data = getLocalData();
  data[key] = value;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export function useUserData() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [library, setLibrary] = useState([]); // books in user's shelf
  const [notes, setNotes] = useState({});
  const [readChapters, setReadChapters] = useState({});
  const [settings, setSettings] = useState({ theme: 'dark', subscription: 'free', translation: 'kjv' });
  const [history, setHistory] = useState([]);
  const [backlog, setBacklog] = useState([]);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        await loadUserData(u.uid);
      } else {
        // Load from localStorage for guest mode
        const local = getLocalData();
        setLibrary(local.library || []);
        setNotes(local.notes || {});
        setReadChapters(local.readChapters || {});
        setSettings(local.settings || { theme: 'dark', subscription: 'free', translation: 'kjv' });
        setHistory(local.history || []);
        setBacklog(local.backlog || []);
      }
    });
    return () => unsub();
  }, []);

  const loadUserData = async (uid) => {
    try {
      const settingsDoc = await getDoc(doc(db, userPath(uid, 'settings'), 'prefs'));
      if (settingsDoc.exists()) setSettings(settingsDoc.data());

      const librarySnap = await getDocs(collection(db, userPath(uid, 'library')));
      setLibrary(librarySnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const notesSnap = await getDocs(collection(db, userPath(uid, 'notes')));
      const n = {};
      notesSnap.docs.forEach(d => { n[d.id] = d.data(); });
      setNotes(n);

      const readSnap = await getDocs(collection(db, userPath(uid, 'readChapters')));
      const r = {};
      readSnap.docs.forEach(d => { r[d.id] = d.data(); });
      setReadChapters(r);

      const histSnap = await getDocs(collection(db, userPath(uid, 'history')));
      setHistory(histSnap.docs.map(d => d.data()).sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 20));
    } catch (err) {
      console.warn('Error loading Firestore data, using local:', err);
    }
  };

  const persist = useCallback(async (collectionName, docId, data) => {
    if (user) {
      try {
        await setDoc(doc(db, userPath(user.uid, collectionName), docId), data, { merge: true });
      } catch (err) {
        console.warn('Firestore write failed, using local storage:', err);
      }
    }
  }, [user]);

  // Library
  const addToLibrary = useCallback(async (bookId) => {
    const isPremium = settings.subscription === 'premium';
    if (!isPremium && library.length >= 1) return false; // free tier limit
    const entry = { bookId, addedAt: Date.now() };
    setLibrary(prev => [...prev, { id: bookId, ...entry }]);
    setLocalData('library', [...library, { id: bookId, ...entry }]);
    await persist('library', bookId, entry);
    return true;
  }, [library, settings.subscription, persist]);

  const removeFromLibrary = useCallback(async (bookId) => {
    setLibrary(prev => prev.filter(b => b.id !== bookId));
    setLocalData('library', library.filter(b => b.id !== bookId));
    if (user) {
      try {
        await deleteDoc(doc(db, userPath(user.uid, 'library'), bookId));
      } catch {}
    }
  }, [library, user]);

  const isInLibrary = useCallback((bookId) => library.some(b => b.id === bookId), [library]);

  // Read chapters
  const markChapterRead = useCallback(async (bookId, chapter) => {
    const key = `${bookId}_${chapter}`;
    const data = { bookId, chapter, readAt: Date.now() };
    setReadChapters(prev => ({ ...prev, [key]: data }));
    await persist('readChapters', key, data);
  }, [persist]);

  const unmarkChapterRead = useCallback(async (bookId, chapter) => {
    const key = `${bookId}_${chapter}`;
    setReadChapters(prev => { const n = { ...prev }; delete n[key]; return n; });
    if (user) {
      try { await deleteDoc(doc(db, userPath(user.uid, 'readChapters'), key)); } catch {}
    }
  }, [user]);

  const isChapterRead = useCallback((bookId, chapter) =>
    !!readChapters[`${bookId}_${chapter}`], [readChapters]);

  const readCount = Object.keys(readChapters).length;

  // Notes
  const saveNote = useCallback(async (bookId, chapter, verse, text) => {
    const key = `${bookId}_${chapter}_${verse}`;
    const data = { bookId, chapter, verse, text, updatedAt: Date.now() };
    setNotes(prev => ({ ...prev, [key]: data }));
    await persist('notes', key, data);
  }, [persist]);

  const getNote = useCallback((bookId, chapter, verse) =>
    notes[`${bookId}_${chapter}_${verse}`]?.text || '', [notes]);

  // History
  const addToHistory = useCallback(async (bookId, chapter) => {
    const entry = { bookId, chapter, viewedAt: Date.now() };
    setHistory(prev => [entry, ...prev.filter(h => h.bookId !== bookId || h.chapter !== chapter)].slice(0, 20));
    if (user) {
      try {
        await setDoc(doc(db, userPath(user.uid, 'history'), `${bookId}_${chapter}_${Date.now()}`), entry);
      } catch {}
    }
  }, [user]);

  // Settings
  const updateSettings = useCallback(async (updates) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    setLocalData('settings', updated);
    await persist('settings', 'prefs', updated);
  }, [settings, persist]);

  // Badge
  const currentBadge = BADGES.slice().reverse().find(b => readCount >= b.requirement) || BADGES[0];

  // Auth actions
  const signInGuest = useCallback(async () => {
    try { await signInAnonymously(auth); } catch (err) { console.error(err); }
  }, []);

  const signInGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) { console.error(err); }
  }, []);

  const logOut = useCallback(async () => {
    try { await signOut(auth); } catch {}
  }, []);

  return {
    user, authLoading,
    library, addToLibrary, removeFromLibrary, isInLibrary,
    readChapters, markChapterRead, unmarkChapterRead, isChapterRead, readCount,
    notes, saveNote, getNote,
    history, addToHistory,
    backlog, setBacklog,
    settings, updateSettings,
    currentBadge,
    signInGuest, signInGoogle, logOut,
  };
}

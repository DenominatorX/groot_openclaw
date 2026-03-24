import { useState, useEffect } from 'react';
import { onAuthChange, signInAnon } from '../firebase/auth';
import { isFirebaseReady } from '../firebase/config';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady()) {
      setLoading(false);
      return;
    }

    const unsub = onAuthChange(u => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  async function ensureAuth() {
    if (user) return user;
    if (!isFirebaseReady()) return null;
    try {
      return await signInAnon();
    } catch {
      return null;
    }
  }

  return { user, loading, ensureAuth };
}

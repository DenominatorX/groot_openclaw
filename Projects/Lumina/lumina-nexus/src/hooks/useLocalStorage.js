import { useState, useEffect } from 'react';

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);

  return [val, setVal];
}

import { useState, useEffect, useRef } from 'react';
import { BIBLE_API_NAMES, BIBLE_COLLECTIONS } from '../utils/constants';
import { LOCAL_TEXTS } from '../utils/mockData';
import { fetchTextViaAI } from '../services/gemini';

const cache = new Map();

async function fetchChapterFromAPI(bookId, chapter, translation = 'kjv', signal) {
  const apiName = BIBLE_API_NAMES[bookId];
  if (!apiName) throw new Error('Book not in Bible API');
  const url = `https://bible-api.com/${apiName}+${chapter}?translation=${translation}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (!data.verses?.length) throw new Error('No verses returned');
  return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }));
}

export function useBibleContent(bookId, chapter, translation = 'kjv') {
  const [verses, setVerses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!bookId || !chapter) return;

    const cacheKey = `${bookId}_${chapter}_${translation}`;
    if (cache.has(cacheKey)) {
      setVerses(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let result;

        // Check local mock data first
        const localKey = `${bookId}_${chapter}`;
        if (LOCAL_TEXTS[localKey]) {
          result = LOCAL_TEXTS[localKey].verses;
        } else if (BIBLE_COLLECTIONS.includes(
          // Try bible-api.com for supported collections
          BIBLE_API_NAMES[bookId] ? 'christian' : 'other'
        ) && BIBLE_API_NAMES[bookId]) {
          result = await fetchChapterFromAPI(bookId, chapter, translation, controller.signal);
        } else {
          // Fall back to AI for non-Bible texts
          const book = bookId.replace(/([0-9]+)/g, '$1 ').trim();
          const aiData = await fetchTextViaAI(book, chapter, controller.signal);
          result = aiData?.verses || [];
        }

        cache.set(cacheKey, result);
        if (!controller.signal.aborted) {
          setVerses(result);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [bookId, chapter, translation]);

  return { verses, loading, error };
}

export async function fetchSingleVerse(bookId, chapter, verse, translation = 'kjv') {
  const cacheKey = `verse_${bookId}_${chapter}_${verse}_${translation}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const apiName = BIBLE_API_NAMES[bookId];
    if (!apiName) return null;
    const url = `https://bible-api.com/${apiName}+${chapter}:${verse}?translation=${translation}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.verses?.[0]?.text?.trim() || data.text?.trim();
    if (text) cache.set(cacheKey, text);
    return text || null;
  } catch {
    return null;
  }
}

import { useState, useCallback } from 'react';
import { saveUserResearch, getUserResearch } from '../firebase/db';

/**
 * Manages user-overridden confidence scores.
 * Base scores come from LINEAGE data; user overrides saved to Firestore.
 */
export function useConfidenceScore(person, ensureAuth) {
  const [override, setOverride] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load existing override from Firestore
  async function loadOverride() {
    if (!person) return;
    const research = await getUserResearch(person.id);
    if (research?.confidenceOverride != null) {
      setOverride(research.confidenceOverride);
    }
  }

  const saveOverride = useCallback(async (score) => {
    if (!person) return;
    const authedUser = await ensureAuth();
    if (!authedUser) return;
    setSaving(true);
    try {
      await saveUserResearch(person.id, { confidenceOverride: score });
      setOverride(score);
    } finally {
      setSaving(false);
    }
  }, [person, ensureAuth]);

  const effectiveScore = override ?? person?.confidence ?? 50;

  return { effectiveScore, override, saveOverride, saving, loadOverride };
}

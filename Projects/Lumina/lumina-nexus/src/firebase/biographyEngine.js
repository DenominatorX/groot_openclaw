/**
 * AI Biography Engine
 *
 * Generates deep contextual biographies for Biblical figures using the
 * Anthropic Claude or Google Gemini API (user supplies key via Config Panel).
 * Results are cached in Firestore to prevent redundant API calls.
 *
 * Also performs cross-name identity detection: identifies the same person
 * under different names across KJV / NIV / Septuagint.
 */

import { getCachedBio, setCachedBio } from './db';
import { TRANSLATION_VARIANTS, LINEAGE } from '../data/lineage';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const GEMINI_API    = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function getApiKeys() {
  return {
    anthropic: localStorage.getItem('nexus_anthropic_key') || '',
    gemini:    localStorage.getItem('nexus_gemini_key') || '',
    openai:    localStorage.getItem('nexus_openai_key') || '',
  };
}

function buildBioPrompt(person) {
  const variants = TRANSLATION_VARIANTS[person.id];
  const altNames = variants
    ? `This person is also known as: KJV "${variants.kjv}", NIV "${variants.niv}", Septuagint "${variants.lxx}".`
    : '';

  const ancestors = [];
  let cur = LINEAGE.find(p => p.id === person.parent);
  while (cur && ancestors.length < 5) {
    ancestors.push(cur.name);
    cur = LINEAGE.find(p => p.id === cur.parent);
  }
  const ancestryStr = ancestors.length ? `Ancestry: ${ancestors.join(' → ')} → ${person.name}` : '';

  return `You are a Biblical scholar and theologian. Write a deep contextual biography of ${person.name}.

${altNames}
${ancestryStr}
Scripture references: ${(person.refs || []).join(', ')}
Era: ${person.era}
${person.significance ? `Theological significance: ${person.significance}` : ''}

Your biography should:
1. Summarize their life and role in scripture with specific chapter and verse citations
2. Discuss their theological significance
3. Note any appearance under different names across KJV, NIV, and Septuagint (if applicable)
4. Identify if this person may be the same individual mentioned under a different name elsewhere in scripture
5. Note connections to other Biblical figures in the lineage

Keep response under 400 words. Use plain prose, no headers or markdown.`;
}

async function generateViaClaude(person, apiKey) {
  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: buildBioPrompt(person) }],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Claude API ${response.status}: ${err.slice(0, 120)}`);
  }

  const data = await response.json();
  return data.content?.find(c => c.type === 'text')?.text || '';
}

async function generateViaGemini(person, apiKey) {
  const url = `${GEMINI_API}?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildBioPrompt(person) }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Gemini API ${response.status}: ${err.slice(0, 120)}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Generate (or retrieve cached) biography for a person.
 * Returns { bio: string, source: 'cache'|'claude'|'gemini', error?: string }
 */
export async function generateBiography(person, { useFirestoreCache = true } = {}) {
  // 1. Check Firestore cache
  if (useFirestoreCache) {
    const cached = await getCachedBio(person.id);
    if (cached?.bio) return { bio: cached.bio, source: 'cache' };
  }

  const keys = getApiKeys();

  // 2. Try Claude first
  if (keys.anthropic) {
    try {
      const bio = await generateViaClaude(person, keys.anthropic);
      if (bio) {
        if (useFirestoreCache) await setCachedBio(person.id, { bio, generatedBy: 'claude' });
        return { bio, source: 'claude' };
      }
    } catch (err) {
      console.warn('Claude failed, trying Gemini:', err.message);
    }
  }

  // 3. Fallback to Gemini
  if (keys.gemini) {
    try {
      const bio = await generateViaGemini(person, keys.gemini);
      if (bio) {
        if (useFirestoreCache) await setCachedBio(person.id, { bio, generatedBy: 'gemini' });
        return { bio, source: 'gemini' };
      }
    } catch (err) {
      return { bio: null, source: null, error: err.message };
    }
  }

  return {
    bio: null,
    source: null,
    error: 'No API key configured. Add your Anthropic or Gemini key in Settings.',
  };
}

/**
 * Cross-name identity detection.
 * Returns a list of people who may be the same individual under different names.
 */
export function findAltIdentities(person) {
  const variants = TRANSLATION_VARIANTS[person.id];
  if (!variants) return [];

  const allNames = Object.values(variants).map(n => n.toLowerCase());
  return LINEAGE.filter(p => {
    if (p.id === person.id) return false;
    const pName = p.name.toLowerCase();
    return allNames.some(n => n !== person.name.toLowerCase() && pName.includes(n));
  });
}

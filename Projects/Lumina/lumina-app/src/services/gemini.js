const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(prompt, signal) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
  const res = await fetch(`${GEMINI_BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function analyzeVerse(book, chapter, verse, verseText, perspective, signal) {
  const prompt = `You are a scholarly theologian and comparative religion expert.
Analyze the following verse from "${book}" Chapter ${chapter}, Verse ${verse} from the ${perspective} perspective:

"${verseText}"

Provide a thoughtful, balanced analysis of about 200-300 words. Use markdown formatting.
Focus on historical context, theological significance, and the unique insights this perspective offers.`;
  return callGemini(prompt, signal);
}

export async function analyzeChapter(book, chapter, chapterText, perspective, signal) {
  const prompt = `You are a scholarly theologian and comparative religion expert.
Analyze the following chapter from "${book}" Chapter ${chapter} from the ${perspective} perspective.

Chapter content (first 2000 chars):
"${chapterText.slice(0, 2000)}"

Provide a comprehensive analysis of about 400-500 words in markdown format covering:
1. Overview and key themes
2. Historical/cultural context
3. Unique insights from the ${perspective} perspective
4. Key takeaways`;
  return callGemini(prompt, signal);
}

export async function chatAboutVerse(book, chapter, verse, verseText, question, history, signal) {
  const historyStr = history.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
  const prompt = `You are a knowledgeable, thoughtful guide for studying sacred texts.
Context: ${book} Chapter ${chapter}, Verse ${verse}: "${verseText}"

Conversation so far:
${historyStr}

User's question: ${question}

Respond thoughtfully in 2-3 paragraphs using markdown. Be scholarly yet accessible.`;
  return callGemini(prompt, signal);
}

export async function searchTexts(query, signal) {
  const prompt = `You are a sacred texts scholar. Given this thematic search query: "${query}"
List 5-8 relevant passages from sacred texts (Bible, Bhagavad Gita, Tao Te Ching, etc.) that address this theme.
For each, provide: Book, Chapter:Verse reference, brief quote, and why it's relevant.
Format as JSON array: [{ "book": "", "chapter": 0, "verse": 0, "quote": "", "relevance": "" }]`;
  const text = await callGemini(prompt, signal);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export async function getSimpleTranslation(book, chapter, verseText, signal) {
  const prompt = `Rewrite this passage from ${book} Chapter ${chapter} in simple, modern English while preserving the meaning:

"${verseText}"

Keep it faithful to the original but accessible to a modern reader.`;
  return callGemini(prompt, signal);
}

export async function fetchTextViaAI(book, chapter, signal) {
  const prompt = `Provide the complete text of ${book}, Chapter ${chapter}.
Format as a JSON object:
{
  "verses": [
    { "number": 1, "text": "verse text here" },
    ...
  ]
}
Be accurate and complete. Only return the JSON.`;
  const text = await callGemini(prompt, signal);
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

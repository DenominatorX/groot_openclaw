// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
export const TRANSLATIONS = [
  { id: 'kjv', label: 'KJV', full: 'King James Version' },
  { id: 'web', label: 'WEB', full: 'World English Bible' },
  { id: 'bbe', label: 'BBE', full: 'Bible in Basic English' },
  { id: 'asv', label: 'ASV', full: 'American Standard Version' },
];

// ─── THEMES ──────────────────────────────────────────────────────────────────
export const THEMES = {
  dark: { bg: 'bg-zinc-950', surface: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-100', muted: 'text-zinc-400' },
  light: { bg: 'bg-stone-50', surface: 'bg-white', border: 'border-stone-200', text: 'text-stone-900', muted: 'text-stone-500' },
  grey: { bg: 'bg-neutral-900', surface: 'bg-neutral-800', border: 'border-neutral-700', text: 'text-neutral-100', muted: 'text-neutral-400' },
};

// ─── BADGES ──────────────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'seeker', title: 'Seeker', requirement: 0, description: 'Your journey begins.' },
  { id: 'disciple', title: 'Disciple', requirement: 10, description: 'Read 10 chapters.' },
  { id: 'scholar', title: 'Scholar', requirement: 50, description: 'Read 50 chapters.' },
  { id: 'sage', title: 'Sage', requirement: 150, description: 'Read 150 chapters.' },
  { id: 'master', title: 'Master', requirement: 300, description: 'Read 300 chapters.' },
];

// ─── AI ANALYSIS PERSPECTIVES ────────────────────────────────────────────────
export const PERSPECTIVES = [
  { id: 'christian', label: 'Christian Theology' },
  { id: 'jewish', label: 'Jewish (Rabbinic)' },
  { id: 'islamic', label: 'Islamic Perspective' },
  { id: 'hindu', label: 'Hindu Tradition' },
  { id: 'secular', label: 'Secular Historical' },
  { id: 'near_east', label: 'Ancient Near East' },
  { id: 'gnostic', label: 'Gnostic Tradition' },
  { id: 'mystical', label: 'Mystical/Esoteric' },
];

// ─── COLLECTIONS ─────────────────────────────────────────────────────────────
export const COLLECTIONS = [
  { id: 'christian', label: 'Judeo-Christian', icon: '✝️', color: 'from-blue-900 to-blue-800' },
  { id: 'apocrypha', label: 'Apocrypha & Deuterocanon', icon: '📜', color: 'from-purple-900 to-purple-800' },
  { id: 'mesopotamian', label: 'Ancient Mesopotamian', icon: '🏛️', color: 'from-amber-900 to-amber-800' },
  { id: 'egyptian', label: 'Ancient Egyptian', icon: '𓂀', color: 'from-yellow-900 to-yellow-800' },
  { id: 'eastern', label: 'Eastern Traditions', icon: '☯️', color: 'from-emerald-900 to-emerald-800' },
  { id: 'greek', label: 'Greek & Roman', icon: '🏺', color: 'from-indigo-900 to-indigo-800' },
  { id: 'zoroastrian', label: 'Zoroastrian', icon: '🔥', color: 'from-orange-900 to-orange-800' },
  { id: 'other', label: 'Other Sacred Texts', icon: '📖', color: 'from-zinc-800 to-zinc-700' },
];

// ─── INITIAL LIBRARY (100+ texts) ───────────────────────────────────────────
export const INITIAL_LIBRARY = [
  // Old Testament
  { id: 'genesis', title: 'Genesis', collection: 'christian', testament: 'old', chapters: 50, available: true, sourceUrl: 'https://bible-api.com/{book}+{chapter}:{verse}' },
  { id: 'exodus', title: 'Exodus', collection: 'christian', testament: 'old', chapters: 40, available: true, sourceUrl: 'https://bible-api.com/{book}+{chapter}:{verse}' },
  { id: 'leviticus', title: 'Leviticus', collection: 'christian', testament: 'old', chapters: 27, available: true, sourceUrl: '' },
  { id: 'numbers', title: 'Numbers', collection: 'christian', testament: 'old', chapters: 36, available: true, sourceUrl: '' },
  { id: 'deuteronomy', title: 'Deuteronomy', collection: 'christian', testament: 'old', chapters: 34, available: true, sourceUrl: '' },
  { id: 'joshua', title: 'Joshua', collection: 'christian', testament: 'old', chapters: 24, available: true, sourceUrl: '' },
  { id: 'judges', title: 'Judges', collection: 'christian', testament: 'old', chapters: 21, available: true, sourceUrl: '' },
  { id: 'ruth', title: 'Ruth', collection: 'christian', testament: 'old', chapters: 4, available: true, sourceUrl: '' },
  { id: '1samuel', title: '1 Samuel', collection: 'christian', testament: 'old', chapters: 31, available: true, sourceUrl: '' },
  { id: '2samuel', title: '2 Samuel', collection: 'christian', testament: 'old', chapters: 24, available: true, sourceUrl: '' },
  { id: '1kings', title: '1 Kings', collection: 'christian', testament: 'old', chapters: 22, available: true, sourceUrl: '' },
  { id: '2kings', title: '2 Kings', collection: 'christian', testament: 'old', chapters: 25, available: true, sourceUrl: '' },
  { id: '1chronicles', title: '1 Chronicles', collection: 'christian', testament: 'old', chapters: 29, available: true, sourceUrl: '' },
  { id: '2chronicles', title: '2 Chronicles', collection: 'christian', testament: 'old', chapters: 36, available: true, sourceUrl: '' },
  { id: 'ezra', title: 'Ezra', collection: 'christian', testament: 'old', chapters: 10, available: true, sourceUrl: '' },
  { id: 'nehemiah', title: 'Nehemiah', collection: 'christian', testament: 'old', chapters: 13, available: true, sourceUrl: '' },
  { id: 'esther', title: 'Esther', collection: 'christian', testament: 'old', chapters: 10, available: true, sourceUrl: '' },
  { id: 'job', title: 'Job', collection: 'christian', testament: 'old', chapters: 42, available: true, sourceUrl: '' },
  { id: 'psalms', title: 'Psalms', collection: 'christian', testament: 'old', chapters: 150, available: true, sourceUrl: '' },
  { id: 'proverbs', title: 'Proverbs', collection: 'christian', testament: 'old', chapters: 31, available: true, sourceUrl: '' },
  { id: 'ecclesiastes', title: 'Ecclesiastes', collection: 'christian', testament: 'old', chapters: 12, available: true, sourceUrl: '' },
  { id: 'songofsolomon', title: 'Song of Solomon', collection: 'christian', testament: 'old', chapters: 8, available: true, sourceUrl: '' },
  { id: 'isaiah', title: 'Isaiah', collection: 'christian', testament: 'old', chapters: 66, available: true, sourceUrl: '' },
  { id: 'jeremiah', title: 'Jeremiah', collection: 'christian', testament: 'old', chapters: 52, available: true, sourceUrl: '' },
  { id: 'lamentations', title: 'Lamentations', collection: 'christian', testament: 'old', chapters: 5, available: true, sourceUrl: '' },
  { id: 'ezekiel', title: 'Ezekiel', collection: 'christian', testament: 'old', chapters: 48, available: true, sourceUrl: '' },
  { id: 'daniel', title: 'Daniel', collection: 'christian', testament: 'old', chapters: 12, available: true, sourceUrl: '' },
  { id: 'hosea', title: 'Hosea', collection: 'christian', testament: 'old', chapters: 14, available: true, sourceUrl: '' },
  { id: 'joel', title: 'Joel', collection: 'christian', testament: 'old', chapters: 3, available: true, sourceUrl: '' },
  { id: 'amos', title: 'Amos', collection: 'christian', testament: 'old', chapters: 9, available: true, sourceUrl: '' },
  { id: 'obadiah', title: 'Obadiah', collection: 'christian', testament: 'old', chapters: 1, available: true, sourceUrl: '' },
  { id: 'jonah', title: 'Jonah', collection: 'christian', testament: 'old', chapters: 4, available: true, sourceUrl: '' },
  { id: 'micah', title: 'Micah', collection: 'christian', testament: 'old', chapters: 7, available: true, sourceUrl: '' },
  { id: 'nahum', title: 'Nahum', collection: 'christian', testament: 'old', chapters: 3, available: true, sourceUrl: '' },
  { id: 'habakkuk', title: 'Habakkuk', collection: 'christian', testament: 'old', chapters: 3, available: true, sourceUrl: '' },
  { id: 'zephaniah', title: 'Zephaniah', collection: 'christian', testament: 'old', chapters: 3, available: true, sourceUrl: '' },
  { id: 'haggai', title: 'Haggai', collection: 'christian', testament: 'old', chapters: 2, available: true, sourceUrl: '' },
  { id: 'zechariah', title: 'Zechariah', collection: 'christian', testament: 'old', chapters: 14, available: true, sourceUrl: '' },
  { id: 'malachi', title: 'Malachi', collection: 'christian', testament: 'old', chapters: 4, available: true, sourceUrl: '' },
  // New Testament
  { id: 'matthew', title: 'Matthew', collection: 'christian', testament: 'new', chapters: 28, available: true, sourceUrl: '' },
  { id: 'mark', title: 'Mark', collection: 'christian', testament: 'new', chapters: 16, available: true, sourceUrl: '' },
  { id: 'luke', title: 'Luke', collection: 'christian', testament: 'new', chapters: 24, available: true, sourceUrl: '' },
  { id: 'john', title: 'John', collection: 'christian', testament: 'new', chapters: 21, available: true, sourceUrl: '' },
  { id: 'acts', title: 'Acts', collection: 'christian', testament: 'new', chapters: 28, available: true, sourceUrl: '' },
  { id: 'romans', title: 'Romans', collection: 'christian', testament: 'new', chapters: 16, available: true, sourceUrl: '' },
  { id: '1corinthians', title: '1 Corinthians', collection: 'christian', testament: 'new', chapters: 16, available: true, sourceUrl: '' },
  { id: '2corinthians', title: '2 Corinthians', collection: 'christian', testament: 'new', chapters: 13, available: true, sourceUrl: '' },
  { id: 'galatians', title: 'Galatians', collection: 'christian', testament: 'new', chapters: 6, available: true, sourceUrl: '' },
  { id: 'ephesians', title: 'Ephesians', collection: 'christian', testament: 'new', chapters: 6, available: true, sourceUrl: '' },
  { id: 'philippians', title: 'Philippians', collection: 'christian', testament: 'new', chapters: 4, available: true, sourceUrl: '' },
  { id: 'colossians', title: 'Colossians', collection: 'christian', testament: 'new', chapters: 4, available: true, sourceUrl: '' },
  { id: '1thessalonians', title: '1 Thessalonians', collection: 'christian', testament: 'new', chapters: 5, available: true, sourceUrl: '' },
  { id: '2thessalonians', title: '2 Thessalonians', collection: 'christian', testament: 'new', chapters: 3, available: true, sourceUrl: '' },
  { id: '1timothy', title: '1 Timothy', collection: 'christian', testament: 'new', chapters: 6, available: true, sourceUrl: '' },
  { id: '2timothy', title: '2 Timothy', collection: 'christian', testament: 'new', chapters: 4, available: true, sourceUrl: '' },
  { id: 'titus', title: 'Titus', collection: 'christian', testament: 'new', chapters: 3, available: true, sourceUrl: '' },
  { id: 'philemon', title: 'Philemon', collection: 'christian', testament: 'new', chapters: 1, available: true, sourceUrl: '' },
  { id: 'hebrews', title: 'Hebrews', collection: 'christian', testament: 'new', chapters: 13, available: true, sourceUrl: '' },
  { id: 'james', title: 'James', collection: 'christian', testament: 'new', chapters: 5, available: true, sourceUrl: '' },
  { id: '1peter', title: '1 Peter', collection: 'christian', testament: 'new', chapters: 5, available: true, sourceUrl: '' },
  { id: '2peter', title: '2 Peter', collection: 'christian', testament: 'new', chapters: 3, available: true, sourceUrl: '' },
  { id: '1john', title: '1 John', collection: 'christian', testament: 'new', chapters: 5, available: true, sourceUrl: '' },
  { id: '2john', title: '2 John', collection: 'christian', testament: 'new', chapters: 1, available: true, sourceUrl: '' },
  { id: '3john', title: '3 John', collection: 'christian', testament: 'new', chapters: 1, available: true, sourceUrl: '' },
  { id: 'jude', title: 'Jude', collection: 'christian', testament: 'new', chapters: 1, available: true, sourceUrl: '' },
  { id: 'revelation', title: 'Revelation', collection: 'christian', testament: 'new', chapters: 22, available: true, sourceUrl: '' },
  // Apocrypha
  { id: 'tobit', title: 'Book of Tobit', collection: 'apocrypha', chapters: 14, available: true, sourceUrl: '' },
  { id: 'judith', title: 'Book of Judith', collection: 'apocrypha', chapters: 16, available: true, sourceUrl: '' },
  { id: 'enoch', title: 'Book of Enoch', collection: 'apocrypha', chapters: 108, available: true, sourceUrl: '' },
  { id: 'bookofmormon', title: 'Book of Mormon', collection: 'apocrypha', chapters: 239, available: true, sourceUrl: '' },
  { id: '1maccabees', title: '1 Maccabees', collection: 'apocrypha', chapters: 16, available: false, sourceUrl: '' },
  { id: '2maccabees', title: '2 Maccabees', collection: 'apocrypha', chapters: 15, available: false, sourceUrl: '' },
  { id: 'wisdom', title: 'Wisdom of Solomon', collection: 'apocrypha', chapters: 19, available: false, sourceUrl: '' },
  { id: 'sirach', title: 'Sirach (Ecclesiasticus)', collection: 'apocrypha', chapters: 51, available: false, sourceUrl: '' },
  // Mesopotamian
  { id: 'gilgamesh', title: 'Epic of Gilgamesh', collection: 'mesopotamian', chapters: 12, available: true, sourceUrl: '' },
  { id: 'enumaelish', title: 'Enuma Elish', collection: 'mesopotamian', chapters: 7, available: true, sourceUrl: '' },
  { id: 'atrahasis', title: 'Atrahasis Epic', collection: 'mesopotamian', chapters: 3, available: true, sourceUrl: '' },
  { id: 'hammurabi', title: 'Code of Hammurabi', collection: 'mesopotamian', chapters: 1, available: true, sourceUrl: '' },
  // Egyptian
  { id: 'bookofthedead', title: 'Book of the Dead', collection: 'egyptian', chapters: 192, available: true, sourceUrl: '' },
  { id: 'pyramidtexts', title: 'Pyramid Texts', collection: 'egyptian', chapters: 10, available: false, sourceUrl: '' },
  { id: 'coffintexts', title: 'Coffin Texts', collection: 'egyptian', chapters: 8, available: false, sourceUrl: '' },
  { id: 'amduat', title: 'Amduat', collection: 'egyptian', chapters: 12, available: false, sourceUrl: '' },
  { id: 'bookofgates', title: 'Book of Gates', collection: 'egyptian', chapters: 12, available: false, sourceUrl: '' },
  // Greek & Roman
  { id: 'iliad', title: 'Iliad', collection: 'greek', chapters: 24, available: true, sourceUrl: '' },
  { id: 'odyssey', title: 'Odyssey', collection: 'greek', chapters: 24, available: true, sourceUrl: '' },
  { id: 'theogony', title: 'Theogony', collection: 'greek', chapters: 1, available: true, sourceUrl: '' },
  { id: 'aeneid', title: 'Aeneid', collection: 'greek', chapters: 12, available: false, sourceUrl: '' },
  { id: 'metamorphoses', title: 'Metamorphoses', collection: 'greek', chapters: 15, available: false, sourceUrl: '' },
  // Zoroastrian
  { id: 'avesta', title: 'Avesta', collection: 'zoroastrian', chapters: 21, available: false, sourceUrl: '' },
  { id: 'yasna', title: 'Yasna', collection: 'zoroastrian', chapters: 72, available: false, sourceUrl: '' },
  // Eastern / Indian
  { id: 'rigveda', title: 'Rigveda', collection: 'eastern', chapters: 10, available: false, sourceUrl: '' },
  { id: 'bhagavadgita', title: 'Bhagavad Gita', collection: 'eastern', chapters: 18, available: true, sourceUrl: '' },
  { id: 'dhammapada', title: 'Dhammapada', collection: 'eastern', chapters: 26, available: true, sourceUrl: '' },
  { id: 'upanishads', title: 'Upanishads (Principal)', collection: 'eastern', chapters: 13, available: false, sourceUrl: '' },
  { id: 'taotech', title: 'Tao Te Ching', collection: 'eastern', chapters: 81, available: true, sourceUrl: '' },
  { id: 'analects', title: 'Analects of Confucius', collection: 'eastern', chapters: 20, available: true, sourceUrl: '' },
  { id: 'iching', title: 'I Ching', collection: 'eastern', chapters: 64, available: false, sourceUrl: '' },
  { id: 'gurugranth', title: 'Guru Granth Sahib', collection: 'eastern', chapters: 30, available: false, sourceUrl: '' },
];

// Map book title → API-friendly name
export const BIBLE_API_NAMES = {
  'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus',
  'numbers': 'Numbers', 'deuteronomy': 'Deuteronomy', 'joshua': 'Joshua',
  'judges': 'Judges', 'ruth': 'Ruth', '1samuel': '1+Samuel', '2samuel': '2+Samuel',
  '1kings': '1+Kings', '2kings': '2+Kings', '1chronicles': '1+Chronicles',
  '2chronicles': '2+Chronicles', 'ezra': 'Ezra', 'nehemiah': 'Nehemiah',
  'esther': 'Esther', 'job': 'Job', 'psalms': 'Psalms', 'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes', 'songofsolomon': 'Song+of+Solomon',
  'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
  'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel',
  'amos': 'Amos', 'obadiah': 'Obadiah', 'jonah': 'Jonah', 'micah': 'Micah',
  'nahum': 'Nahum', 'habakkuk': 'Habakkuk', 'zephaniah': 'Zephaniah',
  'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
  'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John',
  'acts': 'Acts', 'romans': 'Romans', '1corinthians': '1+Corinthians',
  '2corinthians': '2+Corinthians', 'galatians': 'Galatians', 'ephesians': 'Ephesians',
  'philippians': 'Philippians', 'colossians': 'Colossians',
  '1thessalonians': '1+Thessalonians', '2thessalonians': '2+Thessalonians',
  '1timothy': '1+Timothy', '2timothy': '2+Timothy', 'titus': 'Titus',
  'philemon': 'Philemon', 'hebrews': 'Hebrews', 'james': 'James',
  '1peter': '1+Peter', '2peter': '2+Peter', '1john': '1+John',
  '2john': '2+John', '3john': '3+John', 'jude': 'Jude', 'revelation': 'Revelation',
};

export const BIBLE_COLLECTIONS = ['christian', 'apocrypha'];

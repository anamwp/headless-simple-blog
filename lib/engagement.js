// Comment upvotes have no WordPress endpoint yet (see design handoff README —
// "a custom meta field or a small plugin"). This is an isolated client-side
// stand-in: swap the two functions below for real API calls once one exists.
const KEY_PREFIX = 'hb_vote_';

export const hasVoted = (commentId) => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(KEY_PREFIX + commentId) === '1';
};

export const toggleVote = (commentId) => {
  if (typeof window === 'undefined') return false;
  const key = KEY_PREFIX + commentId;
  const voted = window.localStorage.getItem(key) === '1';
  if (voted) {
    window.localStorage.removeItem(key);
    return false;
  }
  window.localStorage.setItem(key, '1');
  return true;
};

// Same situation as votes above: no "saved posts" endpoint exists yet (the
// design handoff calls for WordPress user meta). Stand-in until then.
const SAVED_KEY = 'hb_saved_posts';

const readSaved = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getSavedPostIds = () => readSaved();

export const isSaved = (postId) => readSaved().includes(postId);

export const toggleSaved = (postId) => {
  if (typeof window === 'undefined') return false;
  const saved = readSaved();
  const next = saved.includes(postId) ? saved.filter((id) => id !== postId) : [...saved, postId];
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next.includes(postId);
};

// Notification preferences — also no WordPress endpoint yet.
const NOTIFY_KEY = 'hb_notify_prefs';
const NOTIFY_DEFAULTS = { replies: true, moderation: true, fridayIndex: false };

export const getNotifyPrefs = () => {
  if (typeof window === 'undefined') return NOTIFY_DEFAULTS;
  try {
    return { ...NOTIFY_DEFAULTS, ...JSON.parse(window.localStorage.getItem(NOTIFY_KEY) || '{}') };
  } catch {
    return NOTIFY_DEFAULTS;
  }
};

export const setNotifyPrefs = (prefs) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(NOTIFY_KEY, JSON.stringify(prefs));
};

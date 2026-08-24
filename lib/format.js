const WORDS_PER_MINUTE = 200;

export const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

// "02 Aug 2026" — zero-padded day, short month. Used for list rows and metadata.
export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month} ${date.getFullYear()}`;
};

// "18 August 2026" — full month name. Used in prose-adjacent bylines.
export const formatDateLong = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'long' });
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
};

export const readingTime = (html) => {
  const words = stripHtml(html).split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min`;
};

export const initials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const excerptText = (excerptRendered, wordLimit = 28) => {
  const text = stripHtml(excerptRendered);
  const words = text.split(' ').filter(Boolean);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '…';
};

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

export const relativeTime = (dateString) => {
  const then = new Date(dateString).getTime();
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (diffSeconds < MINUTE) return 'just now';
  if (diffSeconds < HOUR) {
    const m = Math.floor(diffSeconds / MINUTE);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diffSeconds < DAY) {
    const h = Math.floor(diffSeconds / HOUR);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diffSeconds < WEEK) {
    const d = Math.floor(diffSeconds / DAY);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  return formatDateShort(dateString);
};

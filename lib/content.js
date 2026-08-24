const slugify = (text) =>
  text
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'section';

// Pulls h2/h3 headings out of already-sanitized WP content HTML for the
// "In this note" TOC, and injects matching ids into the source HTML so the
// links can scroll to them.
export const extractHeadings = (html) => {
  if (!html) return { html: html || '', headings: [] };

  const headings = [];
  const seen = new Map();
  const headingPattern = /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi;

  const outHtml = html.replace(headingPattern, (match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').trim();
    if (!text) return match;

    let id = slugify(text);
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    headings.push({ id, text, level: Number(level) });

    const hasId = /\sid=/.test(attrs);
    const newAttrs = hasId ? attrs.replace(/\sid="[^"]*"/, ` id="${id}"`) : `${attrs} id="${id}"`;
    return `<h${level}${newAttrs}>${inner}</h${level}>`;
  });

  return { html: outHtml, headings };
};

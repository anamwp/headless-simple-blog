import sanitizeHtmlLib from 'sanitize-html';

// Defense-in-depth: don't trust that WordPress-side sanitization (wp_kses) is
// always correctly configured. Strips <script>, event handlers, javascript:
// URIs, etc. before any WP-sourced HTML reaches dangerouslySetInnerHTML.
//
// Uses sanitize-html (pure JS, no DOM emulation) rather than
// isomorphic-dompurify: DOMPurify's server-side path pulls in jsdom, which
// Next.js always treats as a runtime-external dependency on Vercel, and
// jsdom's own html-encoding-sniffer dependency ships an ESM-only package
// that Node's require() can't load — crashing every SSR/ISR page that calls
// this with ERR_REQUIRE_ESM.
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sub', 'sup', 'small',
  'a', 'span', 'div',
  'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'iframe',
];

const options = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder'],
    '*': ['class', 'id'],
  },
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
};

export const sanitizeHtml = (html) => {
  if (!html) return '';
  return sanitizeHtmlLib(html, options);
};

export default sanitizeHtml;

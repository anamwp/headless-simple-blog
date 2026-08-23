import DOMPurify from 'isomorphic-dompurify';

// Defense-in-depth: don't trust that WordPress-side sanitization (wp_kses) is
// always correctly configured. Strips <script>, event handlers, javascript:
// URIs, etc. before any WP-sourced HTML reaches dangerouslySetInnerHTML.
export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html);
};

export default sanitizeHtml;

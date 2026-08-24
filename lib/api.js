import axios from './httpClient';
import { sanitizeHtml } from './sanitize';
import { readingTime } from './format';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// List/archive contexts only ever need a post's read time, not its full HTML —
// shipping content.rendered (and SEO-plugin fields like yoast_head_json) to
// every listing page bloats the page payload for no reason. Compute the read
// time server-side and drop the heavy fields before they leave this module.
const slimPost = (post) => {
  const { content, yoast_head, yoast_head_json, ...rest } = post;
  const readTime = readingTime(content?.rendered);
  if (rest._embedded?.['wp:featuredmedia']) {
    rest._embedded['wp:featuredmedia'] = rest._embedded['wp:featuredmedia'].map(
      ({ media_details, ...media }) => media
    );
  }
  return { ...rest, readTime };
};

// Short-TTL in-memory cache for small, slow-changing lists (categories, tags).
// TTL is intentionally longer than the pages' revalidate:10 window so
// slug -> id lookups reuse the same warm list instead of re-querying WP on
// every request. A renamed/added term self-heals within CACHE_TTL_MS.
const CACHE_TTL_MS = 30 * 1000;

function createTtlCache(fetcher, ttlMs = CACHE_TTL_MS) {
  let cache = { data: null, expiresAt: 0 };
  let inFlight = null;

  return async () => {
    if (cache.data && Date.now() < cache.expiresAt) {
      return cache.data;
    }
    if (!inFlight) {
      inFlight = fetcher()
        .then((data) => {
          cache = { data, expiresAt: Date.now() + ttlMs };
          return data;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}

export const getPosts = async (pageNumber = 1, perPage = process.env.NEXT_PUBLIC_POSTS_PER_PAGE) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { page: pageNumber, per_page: perPage, _embed: true },
  });
  const totalPosts = parseInt(response.headers['x-wp-total'], 10);
  return {
    totalPosts,
    data: response.data.map(slimPost),
  };
};

export const getPostBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { slug, _embed: true },
  });
  const post = response.data.length > 0 ? response.data[0] : null;
  if (post?.content?.rendered) {
    post.content.rendered = sanitizeHtml(post.content.rendered);
  }
  return post;
};

export const getPostSlugs = async (perPage = 10) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { per_page: perPage, _fields: 'slug' },
  });
  return response.data;
};

export const getRelatedPosts = async (categoryId, excludePostId, perPage = 3) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { categories: categoryId, exclude: excludePostId, per_page: perPage, _embed: true },
  });
  return response.data;
};

const fetchCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`, { params: { per_page: 100 } });
  return response.data;
};
const getCachedCategories = createTtlCache(fetchCategories);

export const getCategories = async () => getCachedCategories();

export const getCategoryBySlug = async (slug) => {
  // Targeted server-side lookup, not the cached full list - correct
  // regardless of how many categories exist (the list is capped by
  // WordPress's default per_page and isn't guaranteed to include every one).
  const response = await axios.get(`${API_URL}/categories`, {
    params: { slug },
  });
  return response.data.length > 0 ? response.data[0] : null;
};

export const getCategoriesByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const response = await axios.get(`${API_URL}/categories`, {
    params: { include: ids.join(',') },
  });
  return response.data;
};

export const getPostsByCategory = async (categoryId, pageNumber = 1, perPage = process.env.NEXT_PUBLIC_POSTS_PER_PAGE) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { categories: categoryId, page: pageNumber, per_page: perPage, _embed: true },
  });
  const totalPosts = parseInt(response.headers['x-wp-total'], 10);
  return { totalPosts, data: response.data.map(slimPost) };
};

const fetchTags = async () => {
  const response = await axios.get(`${API_URL}/tags`, { params: { per_page: 100 } });
  return response.data;
};
const getCachedTags = createTtlCache(fetchTags);

export const getTags = async () => getCachedTags();

export const getTagBySlug = async (slug) => {
  // Targeted server-side lookup, not the cached full list - see
  // getCategoryBySlug for why.
  const response = await axios.get(`${API_URL}/tags`, {
    params: { slug },
  });
  return response.data.length > 0 ? response.data[0] : null;
};

export const getTagsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const response = await axios.get(`${API_URL}/tags`, {
    params: { include: ids.join(',') },
  });
  return response.data;
};

export const getPostsByTag = async (tagId, pageNumber = 1, perPage = process.env.NEXT_PUBLIC_POSTS_PER_PAGE) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { tags: tagId, page: pageNumber, per_page: perPage, _embed: true },
  });
  const totalPosts = parseInt(response.headers['x-wp-total'], 10);
  return { totalPosts, data: response.data.map(slimPost) };
};

export const searchPosts = async (query, perPage = 20) => {
  if (!query) return { data: [], totalPosts: 0 };
  const response = await axios.get(`${API_URL}/posts`, {
    params: { search: query, per_page: perPage, _embed: true },
  });
  const totalPosts = parseInt(response.headers['x-wp-total'], 10);
  return { totalPosts, data: response.data.map(slimPost) };
};

export const getComments = async (postId) => {
  const response = await axios.get(`${API_URL}/comments`, {
    params: { post: postId },
  });
  return response.data.map((comment) => ({
    ...comment,
    content: { ...comment.content, rendered: sanitizeHtml(comment.content?.rendered) },
  }));
};

export const getPostsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const response = await axios.get(`${API_URL}/posts`, {
    params: { include: ids.join(','), per_page: ids.length, _embed: true },
  });
  return response.data.map(slimPost);
};

// Dashboard "my posts": needs draft/pending statuses too, which WP only
// returns to an authenticated request from the post's own author (or
// someone with edit_others_posts).
export const getMyPosts = async (token, authorId, { page = 1, perPage = 20, status = ['publish', 'draft', 'pending'] } = {}) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { author: authorId, status: status.join(','), page, per_page: perPage, _embed: true, orderby: 'modified' },
    headers: { Authorization: `Bearer ${token}` },
  });
  const totalPosts = parseInt(response.headers['x-wp-total'], 10) || 0;
  return { totalPosts, data: response.data.map(slimPost) };
};

// Cheap count-only lookup — reads the x-wp-total header instead of paging
// through comment bodies.
// Draft/pending posts aren't public, so an unauthenticated comments lookup
// against them 401s — pass the viewer's token when the post might not be
// published.
export const getCommentCountForPost = async (postId, token) => {
  const response = await axios.get(`${API_URL}/comments`, {
    params: { post: postId, per_page: 1 },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return parseInt(response.headers['x-wp-total'], 10) || 0;
};

export const getMyComments = async (token, authorId, perPage = 20) => {
  const response = await axios.get(`${API_URL}/comments`, {
    params: { author: authorId, per_page: perPage, orderby: 'date', order: 'desc', _embed: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.map((comment) => ({
    ...comment,
    content: { ...comment.content, rendered: sanitizeHtml(comment.content?.rendered) },
  }));
};

export const getHeldComments = async (token, perPage = 20) => {
  const response = await axios.get(`${API_URL}/comments`, {
    params: { status: 'hold', per_page: perPage, _embed: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  const totalHeld = parseInt(response.headers['x-wp-total'], 10) || 0;
  return {
    totalHeld,
    data: response.data.map((comment) => ({
      ...comment,
      content: { ...comment.content, rendered: sanitizeHtml(comment.content?.rendered) },
    })),
  };
};

export const updateCommentStatus = async (commentId, status, token) => {
  return axios.post(
    `${API_URL}/comments/${commentId}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateCommentContent = async (commentId, content, token) => {
  return axios.post(
    `${API_URL}/comments/${commentId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteComment = async (commentId, token) => {
  return axios.delete(`${API_URL}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCurrentUser = async (token, data) => {
  return axios.post(`${API_URL}/users/me`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const submitComment = async ({ postId, parentId = 0, authorName, authorEmail, authorUrl, content, token }) => {
  const payload = { post: postId, parent: parentId, content };
  if (!token) {
    payload.author_name = authorName;
    payload.author_email = authorEmail;
    if (authorUrl) payload.author_url = authorUrl;
  }
  return axios.post(`${API_URL}/comments`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

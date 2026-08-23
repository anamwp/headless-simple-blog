import axios from 'axios';
import { sanitizeHtml } from './sanitize';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    data: response.data,
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
  const response = await axios.get(`${API_URL}/categories`);
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

export const getPostsByCategory = async (categoryId, perPage = process.env.NEXT_PUBLIC_POSTS_PER_PAGE) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { categories: categoryId, per_page: perPage, _embed: true },
  });
  return response.data;
};

const fetchTags = async () => {
  const response = await axios.get(`${API_URL}/tags`);
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

export const getPostsByTag = async (tagId, perPage = process.env.NEXT_PUBLIC_POSTS_PER_PAGE) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { tags: tagId, per_page: perPage, _embed: true },
  });
  return response.data;
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

export const submitComment = async ({ postId, parentId = 0, authorName, authorEmail, content }) => {
  return axios.post(`${API_URL}/comments`, {
    post: postId,
    parent: parentId,
    author_name: authorName,
    author_email: authorEmail,
    content,
  });
};

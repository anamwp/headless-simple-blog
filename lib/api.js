import axios from 'axios';
import { sanitizeHtml } from './sanitize';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const getCategoryBySlug = async (slug) => {
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

export const getTags = async () => {
  const response = await axios.get(`${API_URL}/tags`);
  return response.data;
};

export const getTagBySlug = async (slug) => {
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

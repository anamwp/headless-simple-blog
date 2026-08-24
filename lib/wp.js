// Helpers for reading data out of a WordPress REST post fetched with _embed=true.

export const getFeaturedMedia = (post) => post?._embedded?.['wp:featuredmedia']?.[0] || null;

export const getFeaturedImage = (post) => getFeaturedMedia(post)?.source_url || null;

export const getAuthor = (post) => {
  const author = post?._embedded?.author?.[0];
  if (!author) return { name: 'Unknown', description: '', avatar: null };
  return {
    name: author.name || 'Unknown',
    description: author.description || '',
    avatar: author.avatar_urls?.['96'] || null,
  };
};

// _embedded['wp:term'] is an array of arrays, one per taxonomy assigned to
// the post — categories first, tags second, in the order WP registers them.
export const getPostCategories = (post) => post?._embedded?.['wp:term']?.[0] || [];
export const getPostTags = (post) => post?._embedded?.['wp:term']?.[1] || [];
export const getPrimaryCategory = (post) => getPostCategories(post)[0] || null;

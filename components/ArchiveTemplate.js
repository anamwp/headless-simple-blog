import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPostsByCategory, getPostsByTag } from '@/lib/api';
import { getAuthor, getPrimaryCategory } from '@/lib/wp';
import { formatDateShort, excerptText } from '@/lib/format';

const POSTS_PER_PAGE = Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE);

const ArchiveTemplate = ({ kind, term, initialPosts, initialTotal, categories, tags }) => {
  const isCategory = kind === 'Category';
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
    setTotal(initialTotal);
    setPage(1);
  }, [term.id, initialPosts, initialTotal]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const goToPage = async (nextPage) => {
    if (loading || nextPage < 1 || nextPage > totalPages) return;
    setLoading(true);
    try {
      const response = isCategory
        ? await getPostsByCategory(term.id, nextPage, POSTS_PER_PAGE)
        : await getPostsByTag(term.id, nextPage, POSTS_PER_PAGE);
      setPosts(response.data);
      setTotal(response.totalPosts);
      setPage(nextPage);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error fetching archive page:', error);
    } finally {
      setLoading(false);
    }
  };

  const countLabel = isCategory
    ? `${total} post${total === 1 ? '' : 's'}${totalPages > 1 ? ` — page ${page} of ${totalPages}` : ''}`
    : `${total} post${total === 1 ? '' : 's'} tagged${totalPages > 1 ? ` — page ${page} of ${totalPages}` : ''}`;

  const blurb = term.description || `Posts filed under ${term.name}.`;

  return (
    <main className="shell">
      <header style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{kind}</div>
        <div
          className="grid-2"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 220px', gap: 'var(--space-8)', alignItems: 'end', marginTop: 'var(--space-3)' }}
        >
          <h1 className="display-76" style={{ fontSize: 76, lineHeight: 0.95, letterSpacing: '-.035em', margin: 0 }}>{term.name}</h1>
          <div className="text-muted" style={{ fontSize: 12 }}>{countLabel}</div>
        </div>
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: '56ch', margin: 'var(--space-6) 0 var(--space-6)' }}>{blurb}</p>
        <div style={{ height: 2, background: 'var(--color-divider)' }} />
      </header>

      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <aside className="sticky-rail" style={{ alignContent: 'start', display: 'grid', gap: 'var(--space-6)' }}>
          {categories.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-3)' }}>
                Categories
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 13 }}>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    aria-current={isCategory && c.id === term.id ? 'page' : undefined}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}
                  >
                    {c.name} <span className="text-muted">{c.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-3)' }}>
                Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {tags.map((t) => (
                  <Link key={t.id} href={`/tag/${t.slug}`} className="tag tag-neutral" style={{ textDecoration: 'none' }}>
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div style={{ borderTop: '1px solid var(--color-divider)' }}>
          {posts.map((post) => {
            const category = getPrimaryCategory(post);
            const author = getAuthor(post);
            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="row-3col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr) 200px',
                  gap: 'var(--space-8)',
                  padding: 'var(--space-6) 0',
                  borderBottom: '1px solid var(--color-divider)',
                  textDecoration: 'none',
                  color: 'inherit',
                  alignItems: 'start',
                }}
              >
                <div>
                  <h2
                    style={{ margin: 0, fontSize: 30, lineHeight: 1.1, letterSpacing: '-.02em' }}
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <p className="text-muted" style={{ margin: 'var(--space-2) 0 0', fontSize: 15, lineHeight: 1.55, maxWidth: '60ch' }}>
                    {excerptText(post.excerpt?.rendered, 30)}
                  </p>
                </div>
                <div className="text-muted" style={{ fontSize: 12, display: 'grid', gap: 'var(--space-1)' }}>
                  <span>{formatDateShort(post.date)}</span>
                  {!isCategory && category && <span>{category.name}</span>}
                  <span>{author.name}</span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            );
          })}
          {posts.length === 0 && <p className="text-muted" style={{ padding: 'var(--space-6) 0' }}>No posts here yet.</p>}
          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-6)' }}>
            <button type="button" className="btn btn-secondary" disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>
              Previous
            </button>
            <button type="button" className="btn btn-secondary" disabled={page >= totalPages || loading} onClick={() => goToPage(page + 1)}>
              Next page
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ArchiveTemplate;

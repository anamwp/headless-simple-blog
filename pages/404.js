import Link from 'next/link';
import { getPosts, getCommentCountForPost } from '@/lib/api';
import { stripHtml } from '@/lib/format';

export async function getStaticProps() {
  const recent = await getPosts(1, 15);
  const counts = await Promise.all(recent.data.map((p) => getCommentCountForPost(p.id)));
  const mostDiscussed = recent.data
    .map((p, i) => ({ id: p.id, slug: p.slug, title: p.title.rendered, comments: counts[i] }))
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 3);

  return { props: { mostDiscussed }, revalidate: 60 };
}

export default function NotFound({ mostDiscussed }) {
  return (
    <main className="shell" style={{ padding: 'var(--space-8) var(--space-8) 0', minHeight: 'calc(100vh - 260px)' }}>
      <div style={{ height: 2, background: 'var(--color-accent)' }} />
      <div
        className="grid-2"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: 'var(--space-8)', paddingTop: 'var(--space-8)' }}
      >
        <div>
          <div className="display-180" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 180, lineHeight: 0.82, letterSpacing: '-.05em', color: 'var(--color-accent)' }}>
            404
          </div>
          <h1 style={{ fontSize: 44, letterSpacing: '-.03em', margin: 'var(--space-6) 0 var(--space-3)' }}>That URL has no post behind it</h1>
          <p className="text-muted" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '52ch', margin: 0 }}>
            The slug may have changed, or the post was unpublished. If you followed a link here, it may be out of date.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Front page</Link>
            <Link href="/search" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Search the archive</Link>
          </div>
        </div>

        {mostDiscussed.length > 0 && (
          <div style={{ borderLeft: '1px solid var(--color-divider)', paddingLeft: 'var(--space-6)' }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>
              Most discussed this month
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {mostDiscussed.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}
                >
                  {stripHtml(post.title)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

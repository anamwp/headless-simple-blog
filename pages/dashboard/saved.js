import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { getPostsByIds } from '@/lib/api';
import { getPrimaryCategory } from '@/lib/wp';
import { getSavedPostIds, toggleSaved } from '@/lib/engagement';
import { stripHtml } from '@/lib/format';

const SavedTab = () => {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    const ids = getSavedPostIds();
    if (ids.length === 0) {
      setPosts([]);
      return;
    }
    getPostsByIds(ids).then(setPosts);
  }, []);

  const remove = (postId) => {
    toggleSaved(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: 0, fontSize: 32, letterSpacing: '-.025em' }}>Saved posts</h2>
        <span className="text-muted" style={{ fontSize: 12 }}>
          {posts === null ? '…' : `${posts.length} saved`} — stored in this browser
        </span>
      </div>
      <div style={{ borderTop: '1px solid var(--color-divider)' }}>
        {posts === null && <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>Loading…</p>}
        {posts?.length === 0 && (
          <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>
            Nothing saved yet — use the bookmark icon on a post to add one.
          </p>
        )}
        {posts?.map((post) => {
          const category = getPrimaryCategory(post);
          return (
            <div
              key={post.id}
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 100px', gap: 'var(--space-4)', alignItems: 'baseline', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-divider)' }}
            >
              <Link href={`/posts/${post.slug}`} style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, letterSpacing: '-.015em', color: 'inherit', textDecoration: 'none' }}>
                {stripHtml(post.title.rendered)}
              </Link>
              <span className="text-muted" style={{ fontSize: 12 }}>{category ? category.name : ''}</span>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, justifySelf: 'start' }} onClick={() => remove(post.id)}>
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default function DashboardSaved() {
  return <DashboardLayout>{() => <SavedTab />}</DashboardLayout>;
}

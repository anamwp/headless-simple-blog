import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getMyPosts, getCommentCountForPost } from '@/lib/api';
import { getPrimaryCategory } from '@/lib/wp';
import { relativeTime, stripHtml } from '@/lib/format';

const SITE_URL = process.env.NEXT_PUBLIC_API_SITE_URL;

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'publish' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Pending', value: 'pending' },
];

const STATUS_TAG = {
  publish: { label: 'Published', className: 'tag tag-neutral' },
  draft: { label: 'Draft', className: 'tag tag-accent' },
  pending: { label: 'Pending', className: 'tag tag-outline' },
};

const PostsTab = ({ userData, user }) => {
  const [posts, setPosts] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!userData?.token || !user?.id) return;
    let isCurrent = true;

    getMyPosts(userData.token, user.id, { perPage: 50 }).then(async (res) => {
      if (!isCurrent) return;
      const counts = await Promise.all(res.data.map((p) => getCommentCountForPost(p.id, userData.token)));
      if (!isCurrent) return;
      setPosts(res.data.map((p, i) => ({ ...p, commentCount: counts[i] })));
    });

    return () => {
      isCurrent = false;
    };
  }, [userData?.token, user?.id]);

  const filtered = (posts || []).filter((p) => filter === 'all' || p.status === filter);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: 0, fontSize: 32, letterSpacing: '-.025em' }}>My posts</h2>
        <div className="seg" role="radiogroup" aria-label="Filter posts by status">
          {FILTERS.map((f) => (
            <label key={f.value} className="seg-opt">
              <input type="radio" name="pf" checked={filter === f.value} onChange={() => setFilter(f.value)} />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      {posts === null ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '44%' }}>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Comments</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => {
              const category = getPrimaryCategory(post);
              const status = STATUS_TAG[post.status] || { label: post.status, className: 'tag tag-neutral' };
              return (
                <tr key={post.id}>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{stripHtml(post.title.rendered)}</td>
                  <td><span className={status.className}>{status.label}</span></td>
                  <td className="text-muted">{category ? category.name : '—'}</td>
                  <td className="text-muted">{post.commentCount}</td>
                  <td className="text-muted" style={{ whiteSpace: 'nowrap' }}>{relativeTime(post.modified || post.date)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <a
                      href={`${SITE_URL}/wp-admin/post.php?post=${post.id}&action=edit`}
                      className="btn btn-ghost"
                      style={{ fontSize: 12, textDecoration: 'none' }}
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                  No posts here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default function DashboardPosts() {
  return <DashboardLayout>{({ userData, user }) => <PostsTab userData={userData} user={user} />}</DashboardLayout>;
}

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { getMyPosts, getMyComments } from '@/lib/api';
import { getSavedPostIds } from '@/lib/engagement';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', key: 'posts' /* unused */ },
  { label: 'My posts', href: '/dashboard/posts', countKey: 'posts' },
  { label: 'Comments', href: '/dashboard/comments', countKey: 'comments' },
  { label: 'Saved', href: '/dashboard/saved', countKey: 'saved' },
  { label: 'Profile', href: '/dashboard/profile' },
];

const logout = () => {
  document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/';
};

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const { userData, user, loading, authed } = useCurrentUser();
  const [counts, setCounts] = useState({ posts: null, comments: null, saved: 0 });

  useEffect(() => {
    if (!loading && !authed) router.replace('/login');
  }, [loading, authed, router]);

  useEffect(() => {
    setCounts((c) => ({ ...c, saved: getSavedPostIds().length }));
  }, []);

  useEffect(() => {
    if (!userData?.token || !user?.id) return;
    let isCurrent = true;
    Promise.all([
      getMyPosts(userData.token, user.id, { perPage: 1 }),
      getMyComments(userData.token, user.id, 100),
    ])
      .then(([postsRes, comments]) => {
        if (!isCurrent) return;
        setCounts((c) => ({ ...c, posts: postsRes.totalPosts, comments: comments.length }));
      })
      .catch((error) => console.error('Failed to load dashboard counts:', error));
    return () => {
      isCurrent = false;
    };
  }, [userData?.token, user?.id]);

  if (loading || !authed) {
    return <p className="shell text-muted" style={{ padding: 'var(--space-8)' }}>Loading…</p>;
  }

  const displayName = user?.name || userData.user_display_name || userData.user_nicename;
  const role = user?.roles?.[0] ? user.roles[0][0].toUpperCase() + user.roles[0].slice(1) : 'Member';

  return (
    <main className="shell">
      <header style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'var(--space-6)', alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
              Signed in — {role}
            </div>
            <h1 className="display-56" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-.03em', margin: 'var(--space-3) 0 0' }}>
              {displayName}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>View site</Link>
            <a href={`${process.env.NEXT_PUBLIC_API_SITE_URL}/wp-admin/post-new.php`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
              New draft
            </a>
          </div>
        </div>
      </header>
      <div style={{ height: 2, background: 'var(--color-divider)' }} />

      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: 'var(--space-8)', padding: 'var(--space-6) 0 var(--space-8)' }}>
        <aside className="sticky-rail" style={{ display: 'grid', gap: 0 }}>
          {NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href;
            const count = item.countKey ? counts[item.countKey] : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 13,
                  padding: '10px 12px 10px 0',
                  borderBottom: '1px solid var(--color-divider)',
                  background: 'transparent',
                  textDecoration: 'none',
                  color: active ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                {item.label}
                <span style={{ opacity: 0.5, fontWeight: 400 }}>{count ?? ''}</span>
              </Link>
            );
          })}
          <div style={{ height: 1, background: 'var(--color-divider)', margin: 'var(--space-4) 0' }} />
          <button
            type="button"
            onClick={logout}
            className="btn btn-ghost"
            style={{ fontSize: 13, padding: 'var(--space-2) 0', justifyContent: 'flex-start' }}
          >
            Sign out
          </button>
        </aside>

        <div>{children({ userData, user })}</div>
      </div>
    </main>
  );
};

export default DashboardLayout;

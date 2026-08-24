import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getMyPosts, getCommentCountForPost, getHeldComments, updateCommentStatus } from '@/lib/api';
import { relativeTime, stripHtml } from '@/lib/format';

const StatCell = ({ label, value, note, accent, border }) => (
  <div style={{ padding: 'var(--space-4) var(--space-4) var(--space-6) 0', borderRight: border ? '1px solid var(--color-divider)' : undefined }}>
    <div className={accent ? undefined : 'text-muted'} style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: accent ? 'var(--color-accent-700)' : undefined }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 44, letterSpacing: '-.03em', lineHeight: 1.1, color: accent ? 'var(--color-accent)' : undefined }}>
      {value}
    </div>
    <div className="text-muted" style={{ fontSize: 12 }}>{note}</div>
  </div>
);

const OverviewTab = ({ userData, user }) => {
  const [publishedCount, setPublishedCount] = useState(null);
  const [commentsOnPosts, setCommentsOnPosts] = useState(null);
  const [heldTotal, setHeldTotal] = useState(0);
  const [heldComments, setHeldComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [moderating, setModerating] = useState(new Set());

  useEffect(() => {
    if (!userData?.token || !user?.id) return;
    let isCurrent = true;

    getMyPosts(userData.token, user.id, { status: ['publish'], perPage: 20 }).then(async (res) => {
      if (!isCurrent) return;
      setPublishedCount(res.totalPosts);

      const counts = await Promise.all(res.data.slice(0, 20).map((p) => getCommentCountForPost(p.id, userData.token)));
      if (!isCurrent) return;
      setCommentsOnPosts(counts.reduce((sum, n) => sum + n, 0));

      const recentPosts = res.data.slice(0, 5).map((p) => ({
        text: `You published ${stripHtml(p.title.rendered)}`,
        when: p.date,
        accent: false,
      }));
      setActivity((prev) => mergeActivity(prev, recentPosts));
    });

    getHeldComments(userData.token, 10)
      .then((res) => {
        if (!isCurrent) return;
        setHeldTotal(res.totalHeld);
        setHeldComments(res.data);
        if (res.data.length > 0) {
          const modActivity = res.data.slice(0, 3).map((c) => ({
            text: `${c.author_name} — comment held for moderation`,
            when: c.date,
            accent: true,
          }));
          setActivity((prev) => mergeActivity(prev, modActivity));
        }
      })
      .catch(() => {
        // No moderate_comments capability — leave the moderation stats at 0
        // rather than pretending they're accurate.
      });

    return () => {
      isCurrent = false;
    };
  }, [userData?.token, user?.id]);

  const act = async (commentId, status) => {
    setModerating((prev) => new Set(prev).add(commentId));
    try {
      await updateCommentStatus(commentId, status, userData.token);
      setHeldComments((prev) => prev.filter((c) => c.id !== commentId));
      setHeldTotal((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to update comment status:', error);
    } finally {
      setModerating((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  return (
    <>
      <div className="stat-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--color-divider)', borderBottom: '2px solid var(--color-divider)' }}>
        <StatCell label="Published" value={publishedCount ?? '—'} note="posts" border />
        <StatCell label="Comments" value={commentsOnPosts ?? '—'} note="on recent posts" border />
        <StatCell label="Views — 30 d" value="—" note="no analytics connected" border />
        <StatCell label="Needs you" value={heldTotal} note="held for moderation" accent />
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 'var(--space-8)', paddingTop: 'var(--space-8)' }}>
        <section>
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>Recent activity</h2>
          <div style={{ borderTop: '1px solid var(--color-divider)' }}>
            {activity.length === 0 && <p className="text-muted" style={{ padding: 'var(--space-3) 0' }}>Nothing yet.</p>}
            {activity.map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px minmax(0,1fr) auto', gap: 'var(--space-3)', alignItems: 'baseline', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)' }}>
                <span style={{ width: 8, height: 8, display: 'block', marginTop: 6, background: a.accent ? 'var(--color-accent)' : 'var(--color-neutral-400)' }} />
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>{a.text}</span>
                <span className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{relativeTime(a.when)}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>Held for moderation</h2>
          <div style={{ borderTop: '1px solid var(--color-divider)' }}>
            {heldComments.length === 0 && <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>Nothing waiting.</p>}
            {heldComments.map((c) => (
              <div key={c.id} style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{c.author_name}</span>
                  <span className="text-muted" style={{ fontSize: 11 }}>on {stripHtml(c._embedded?.up?.[0]?.title?.rendered) || 'a post'}</span>
                </div>
                <p className="text-muted" style={{ margin: 'var(--space-1) 0 var(--space-3)', fontSize: 13, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: c.content.rendered }} />
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-primary" style={{ fontSize: 12, padding: '5px 10px' }} disabled={moderating.has(c.id)} onClick={() => act(c.id, 'approve')}>
                    Approve
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }} disabled={moderating.has(c.id)} onClick={() => act(c.id, 'spam')}>
                    Spam
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} disabled={moderating.has(c.id)} onClick={() => act(c.id, 'trash')}>
                    Trash
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

function mergeActivity(prev, next) {
  const merged = [...prev, ...next];
  merged.sort((a, b) => new Date(b.when) - new Date(a.when));
  return merged.slice(0, 6);
}

export default function DashboardOverview() {
  return <DashboardLayout>{({ userData, user }) => <OverviewTab userData={userData} user={user} />}</DashboardLayout>;
}

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { getMyComments, updateCommentContent, deleteComment } from '@/lib/api';
import { relativeTime, stripHtml } from '@/lib/format';

const OwnComment = ({ comment, token, onChanged }) => {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(stripHtml(comment.content.rendered));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const post = comment._embedded?.up?.[0];

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await updateCommentContent(comment.id, content, token);
      onChanged(comment.id, { content: response.data.content });
      setEditing(false);
    } catch (err) {
      setError(err.response?.status === 403 ? "You don't have permission to edit this comment." : 'Failed to save. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await deleteComment(comment.id, token);
      onChanged(comment.id, null);
    } catch (err) {
      setError(err.response?.status === 403 ? "You don't have permission to delete this comment." : 'Failed to delete. Try again.');
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-divider)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <span className="text-muted" style={{ fontSize: 11 }}>on</span>
        {post ? (
          <Link href={`/posts/${post.slug}`} style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>
            {stripHtml(post.title?.rendered)}
          </Link>
        ) : (
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>a post</span>
        )}
        {comment.status === 'hold' && <span className="tag tag-outline">Awaiting moderation</span>}
        <span className="text-muted" style={{ fontSize: 11 }}>{relativeTime(comment.date)}</span>
      </div>

      {editing ? (
        <div style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <textarea className="input" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-primary" style={{ fontSize: 12, padding: '5px 10px' }} onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={{ margin: 'var(--space-1) 0 var(--space-2)', fontSize: 14, lineHeight: 1.55, maxWidth: '64ch' }} dangerouslySetInnerHTML={{ __html: comment.content.rendered }} />
      )}

      {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 12, margin: '0 0 var(--space-2)' }}>{error}</p>}

      {!editing && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--color-text)', opacity: 0.7 }} onClick={() => setEditing(true)} disabled={busy}>
            Edit
          </button>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={remove} disabled={busy}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const CommentsTab = ({ userData, user }) => {
  const [comments, setComments] = useState(null);

  useEffect(() => {
    if (!userData?.token || !user?.id) return;
    let isCurrent = true;
    getMyComments(userData.token, user.id, 50).then((data) => {
      if (isCurrent) setComments(data);
    });
    return () => {
      isCurrent = false;
    };
  }, [userData?.token, user?.id]);

  const handleChanged = (id, patch) => {
    setComments((prev) => {
      if (patch === null) return prev.filter((c) => c.id !== id);
      return prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
    });
  };

  return (
    <>
      <h2 style={{ margin: '0 0 var(--space-6)', fontSize: 32, letterSpacing: '-.025em' }}>Comments</h2>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>Replies to you</h3>
        <div style={{ borderTop: '1px solid var(--color-divider)', padding: 'var(--space-4) 0' }}>
          <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
            WordPress doesn&apos;t expose a way to look up replies to a specific comment across the whole site yet — this section needs a small
            custom endpoint before it can show real data.
          </p>
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>Your comments</h3>
        <div style={{ borderTop: '1px solid var(--color-divider)' }}>
          {comments === null && <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>Loading…</p>}
          {comments?.length === 0 && <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>You haven&apos;t commented yet.</p>}
          {comments?.map((c) => (
            <OwnComment key={c.id} comment={c} token={userData.token} onChanged={handleChanged} />
          ))}
        </div>
      </section>
    </>
  );
};

export default function DashboardComments() {
  return <DashboardLayout>{({ userData, user }) => <CommentsTab userData={userData} user={user} />}</DashboardLayout>;
}

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { initials, relativeTime } from '@/lib/format';
import { hasVoted, toggleVote } from '@/lib/engagement';
import CommentForm from './CommentForm';

const UpvoteButton = ({ commentId, size }) => {
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    setVoted(hasVoted(commentId));
  }, [commentId]);

  const onClick = () => setVoted(toggleVote(commentId));

  return (
    <button type="button" className={`upvote${voted ? ' is-voted' : ''}`} onClick={onClick} aria-pressed={voted}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
      {voted ? 1 : 0}
    </button>
  );
};

const Reply = ({ reply, isAuthor }) => (
  <div style={{ marginTop: 'var(--space-6)', paddingLeft: 'var(--space-6)', borderLeft: '1px solid var(--color-divider)', display: 'flex', gap: 'var(--space-4)' }}>
    <span
      style={{ width: 32, height: 32, flex: 'none', background: 'var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 11 }}
    >
      {initials(reply.author_name)}
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>{reply.author_name}</span>
        {isAuthor && <span className="tag tag-accent">Author</span>}
        <span className="text-muted" style={{ fontSize: 12 }}>{relativeTime(reply.date)}</span>
      </div>
      <p style={{ margin: 'var(--space-2) 0 0', fontSize: 15, lineHeight: 1.6, maxWidth: '60ch' }} dangerouslySetInnerHTML={{ __html: reply.content.rendered }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        <UpvoteButton commentId={reply.id} size={12} />
      </div>
    </div>
  </div>
);

const CommentThread = ({ comment, replies, postId, postAuthorId, authed, userData, isOwn, isPending, onReplySubmitted }) => {
  const [replying, setReplying] = useState(false);
  const own = isOwn(comment.id);
  const pending = isPending(comment.id);
  const isAuthor = comment.author !== 0 && comment.author === postAuthorId;

  return (
    <article style={{ padding: 'var(--space-6) 0', borderTop: '1px solid var(--color-divider)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <span
          style={{ width: 40, height: 40, flex: 'none', background: 'var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}
        >
          {initials(comment.author_name)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15 }}>{comment.author_name}</span>
            {isAuthor && <span className="tag tag-accent">Author</span>}
            {own && <span className="tag tag-neutral">You</span>}
            {pending && <span className="tag tag-outline">Awaiting moderation</span>}
            <span className="text-muted" style={{ fontSize: 12 }}>{relativeTime(comment.date)}</span>
          </div>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: 16, lineHeight: 1.6, maxWidth: '64ch' }} dangerouslySetInnerHTML={{ __html: comment.content.rendered }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
            <UpvoteButton commentId={comment.id} size={13} />
            {authed ? (
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--color-text)', opacity: 0.7 }} onClick={() => setReplying((v) => !v)}>
                Reply
              </button>
            ) : (
              <Link href="/login" className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--color-text)', opacity: 0.7, textDecoration: 'none' }}>
                Reply
              </Link>
            )}
          </div>

          {replying && (
            <CommentForm
              variant="reply"
              postId={postId}
              parentId={comment.id}
              userData={userData}
              onCancel={() => setReplying(false)}
              onSubmitted={(data, meta) => {
                setReplying(false);
                onReplySubmitted(comment.id, data, meta);
              }}
            />
          )}

          {replies.map((reply) => (
            <Reply key={reply.id} reply={reply} isAuthor={reply.author !== 0 && reply.author === postAuthorId} />
          ))}
        </div>
      </div>
    </article>
  );
};

export default CommentThread;

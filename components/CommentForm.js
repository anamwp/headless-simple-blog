import React, { useState } from 'react';
import Link from 'next/link';
import { submitComment } from '@/lib/api';
import { initials } from '@/lib/format';

const GuestFields = ({ name, setName, email, setEmail, website, setWebsite }) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      <div className="field">
        <label htmlFor="cf-name">Name<span style={{ color: 'var(--color-accent)' }}> *</span></label>
        <input className="input" id="cf-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="cf-mail">Email<span style={{ color: 'var(--color-accent)' }}> *</span></label>
        <input className="input" id="cf-mail" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
    </div>
    <div className="field">
      <label htmlFor="cf-site">Website</label>
      <input className="input" id="cf-site" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
    </div>
  </>
);

// variant: 'guest' (top-level, logged out), 'member' (top-level, logged in),
// or 'reply' (compact inline composer under a comment, logged in only).
const CommentForm = ({ postId, parentId = 0, variant, userData, onSubmitted, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [remember, setRemember] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await submitComment({
        postId,
        parentId,
        authorName: name,
        authorEmail: email,
        authorUrl: website,
        content,
        token: userData?.token,
      });
      if (response.status === 201) {
        setContent('');
        if (!userData?.token) {
          if (!remember) {
            setName('');
            setEmail('');
            setWebsite('');
          }
        }
        onSubmitted?.(response.data, {
          held: response.data.status === 'hold' || response.data.status === undefined,
        });
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      onSubmitted?.(null, { error: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === 'reply') {
    return (
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 'var(--space-3)',
          border: '1px solid var(--color-divider)',
          borderLeft: '2px solid var(--color-accent)',
          padding: 'var(--space-4)',
          display: 'grid',
          gap: 'var(--space-3)',
          background: 'var(--color-surface)',
        }}
      >
        <textarea
          className="input"
          rows={3}
          placeholder="Write a reply…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="submit" className="btn btn-primary" style={{ fontSize: 12, padding: '5px 10px' }} disabled={submitting}>
            {submitting ? 'Posting…' : 'Post reply'}
          </button>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (variant === 'member') {
    return (
      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid var(--color-divider)',
          borderLeft: '2px solid var(--color-accent)',
          padding: 'var(--space-6)',
          display: 'grid',
          gap: 'var(--space-4)',
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              width: 36,
              height: 36,
              flex: 'none',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            {initials(userData.user_display_name || userData.user_nicename)}
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14 }}>
              {userData.user_display_name || userData.user_nicename}
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>Member — comments publish immediately</div>
          </div>
        </div>
        <div className="field">
          <textarea
            className="input"
            rows={4}
            placeholder="Add to the discussion…"
            style={{ minHeight: 110 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
          <span className="text-muted" style={{ fontSize: 12, marginLeft: 'auto' }}>Markdown supported</span>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-4)' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>Leave a comment</div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          Have an account? <Link href="/login">Log in</Link> to skip these fields.
        </div>
      </div>
      <GuestFields name={name} setName={setName} email={email} setEmail={setEmail} website={website} setWebsite={setWebsite} />
      <div className="field">
        <label htmlFor="cf-body">Comment</label>
        <textarea className="input" id="cf-body" rows={4} placeholder="Keep it useful." value={content} onChange={(e) => setContent(e.target.value)} required />
      </div>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 14 }}>
        <input type="checkbox" style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span style={{ fontSize: 13 }}>Save my name and email in this browser for next time</span>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
        <span className="text-muted" style={{ fontSize: 12 }}>Comments from new addresses are held for moderation.</span>
      </div>
    </form>
  );
};

export default CommentForm;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { sanitizeHtml } from '@/lib/sanitize';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export default function LoginPage() {
  const router = useRouter();
  const userData = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userData) router.replace('/dashboard');
  }, [userData, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!username.trim()) errors.username = 'Enter your username or email.';
    if (!password) errors.password = 'Enter your password.';
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_FOR_JWT_TOKEN, { username, password });
      const maxAge = keepSignedIn ? `; max-age=${THIRTY_DAYS}` : '';
      document.cookie = `user_data=${encodeURIComponent(JSON.stringify(response.data))}; path=/${maxAge}`;
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      setFormError(err.response?.data?.message || 'Something went wrong. Check your credentials and try again.');
      setSubmitting(false);
    }
  };

  return (
    <main
      className="grid-2"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,520px)',
        minHeight: 'calc(100vh - 110px)',
        borderTop: '2px solid var(--color-divider)',
      }}
    >
      <div
        style={{
          background: 'var(--color-accent)',
          color: 'var(--color-bg)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.8 }}>
          Headless Blog — Members
        </div>
        <div>
          <h1 className="display-76" style={{ fontSize: 76, lineHeight: 0.94, letterSpacing: '-.035em', margin: 0, maxWidth: '12ch' }}>
            Read it once.<br />Argue about it<br />forever.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: '38ch', margin: 'var(--space-6) 0 0', opacity: 0.9 }}>
            Members comment without moderation delay, save notes to a reading list, and get the Friday index by email.
          </p>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Authentication runs against WordPress. Your credentials never touch this front end.
        </div>
      </div>

      <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420 }}>
        <h2 style={{ fontSize: 40, letterSpacing: '-.03em', margin: '0 0 var(--space-2)' }}>Log in</h2>
        <p className="text-muted" style={{ fontSize: 14, margin: '0 0 var(--space-6)' }}>
          Use your WordPress username or the email on the account.
        </p>
        <div style={{ height: 2, background: 'var(--color-divider)', marginBottom: 'var(--space-6)' }} />

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }} noValidate>
          {formError && (
            <p style={{ color: 'var(--color-accent-700)', fontSize: 13, margin: 0 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formError) }} />
          )}
          <div className="field">
            <label htmlFor="li-user">Username or email</label>
            <input
              className="input"
              id="li-user"
              autoComplete="username"
              placeholder="m.ekdahl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={fieldErrors.username ? { borderColor: 'var(--color-accent)' } : undefined}
            />
            {fieldErrors.username && (
              <div style={{ color: 'var(--color-accent-700)', fontSize: 12, marginTop: 5 }}>{fieldErrors.username}</div>
            )}
          </div>
          <div className="field">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <label htmlFor="li-pass" style={{ margin: 0 }}>Password</label>
              <a href="#" style={{ fontSize: 12 }}>Forgot?</a>
            </div>
            <input
              className="input"
              id="li-pass"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: 5, ...(fieldErrors.password ? { borderColor: 'var(--color-accent)' } : {}) }}
            />
            {fieldErrors.password && (
              <div style={{ color: 'var(--color-accent-700)', fontSize: 12, marginTop: 5 }}>{fieldErrors.password}</div>
            )}
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }}
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />
            <span style={{ fontSize: 13 }}>Keep me signed in for 30 days</span>
          </label>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ minHeight: 44, paddingInline: 'var(--space-4)' }}
            disabled={submitting}
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-6) 0' }}>
          <div style={{ height: 1, background: 'var(--color-divider)', flex: 1 }} />
          <span className="text-muted" style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>Or</span>
          <div style={{ height: 1, background: 'var(--color-divider)', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <span className="text-muted" style={{ fontSize: 13 }}>No account? Registration is open to anyone who has commented before.</span>
          <button type="button" className="btn btn-secondary">Request an account</button>
        </div>
      </div>
    </main>
  );
}

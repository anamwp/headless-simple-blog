import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { updateCurrentUser } from '@/lib/api';
import { initials } from '@/lib/format';
import { getNotifyPrefs, setNotifyPrefs } from '@/lib/engagement';

const fieldsFromUser = (user, userData) => ({
  name: user?.name || userData?.user_display_name || '',
  username: user?.username || user?.slug || userData?.user_nicename || '',
  email: user?.email || userData?.user_email || '',
  url: user?.url || '',
  description: user?.description || '',
});

const ProfileTab = ({ userData, user }) => {
  const [fields, setFields] = useState(fieldsFromUser(user, userData));
  const [notify, setNotify] = useState(getNotifyPrefs());
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFields(fieldsFromUser(user, userData));
  }, [user, userData]);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await updateCurrentUser(userData.token, {
        name: fields.name,
        email: fields.email,
        url: fields.url,
        description: fields.description,
      });
      setNotifyPrefs(notify);
      setStatus('Saved.');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setStatus('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setFields(fieldsFromUser(user, userData));
    setNotify(getNotifyPrefs());
    setStatus('');
  };

  return (
    <>
      <h2 style={{ margin: '0 0 var(--space-6)', fontSize: 32, letterSpacing: '-.025em' }}>Profile</h2>
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: 'var(--space-8)', alignItems: 'start' }}>
        <form onSubmit={save} style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 520 }}>
          {status && <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>{status}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="field">
              <label htmlFor="pr-name">Display name</label>
              <input className="input" id="pr-name" value={fields.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label htmlFor="pr-user">Username</label>
              <input className="input" id="pr-user" value={fields.username} disabled />
            </div>
          </div>
          <div className="field">
            <label htmlFor="pr-mail">Email</label>
            <input className="input" id="pr-mail" type="email" value={fields.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label htmlFor="pr-site">Website</label>
            <input className="input" id="pr-site" value={fields.url} onChange={set('url')} />
          </div>
          <div className="field">
            <label htmlFor="pr-bio">Bio</label>
            <textarea className="input" id="pr-bio" rows={4} value={fields.description} onChange={set('description')} />
          </div>
          <div className="field">
            <label id="pr-notify">Email me when</label>
            <div style={{ display: 'grid', gap: 'var(--space-1)' }} role="group" aria-labelledby="pr-notify">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }}
                  checked={notify.replies}
                  onChange={(e) => setNotify((n) => ({ ...n, replies: e.target.checked }))}
                />
                <span style={{ fontSize: 13 }}>Someone replies to my comment</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }}
                  checked={notify.moderation}
                  onChange={(e) => setNotify((n) => ({ ...n, moderation: e.target.checked }))}
                />
                <span style={{ fontSize: 13 }}>A comment on my post needs moderation</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  style={{ accentColor: 'var(--color-accent)', width: 16, height: 16 }}
                  checked={notify.fridayIndex}
                  onChange={(e) => setNotify((n) => ({ ...n, fridayIndex: e.target.checked }))}
                />
                <span style={{ fontSize: 13 }}>The Friday index is published</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={discard} disabled={saving}>
              Discard
            </button>
          </div>
        </form>
        <div>
          <div className="text-muted" style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            Avatar
          </div>
          <div
            style={{ width: 180, height: 180, background: 'var(--color-neutral-900)', color: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 56 }}
          >
            {initials(fields.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <button type="button" className="btn btn-secondary" disabled title="Needs an avatar plugin (e.g. WP User Avatar) — not installed on this site">
              Upload image
            </button>
            <span className="text-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>Falls back to your Gravatar.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default function DashboardProfile() {
  return <DashboardLayout>{({ userData, user }) => <ProfileTab userData={userData} user={user} />}</DashboardLayout>;
}

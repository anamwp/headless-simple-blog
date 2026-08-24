import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

const SITE_URL = process.env.NEXT_PUBLIC_API_SITE_URL;

const Footer = () => {
  const userData = useAuth();

  return (
    <footer style={{ borderTop: '2px solid var(--color-divider)', marginTop: 'var(--space-8)' }}>
      <div
        className="shell"
        style={{
          padding: 'var(--space-8) var(--space-8)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) auto auto auto',
          gap: 'var(--space-8)',
          alignItems: 'start',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>Headless Blog</div>
          <p className="text-muted" style={{ margin: 'var(--space-2) 0 0', fontSize: 12, maxWidth: '34ch' }}>
            A WordPress archive with the theme layer removed. Content over REST, pages built at the edge.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 13 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <Link href="/category" style={{ color: 'inherit', textDecoration: 'none' }}>Categories</Link>
          <Link href="/tag" style={{ color: 'inherit', textDecoration: 'none' }}>Tags</Link>
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 13 }}>
          <Link href="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Search</Link>
          <a href={`${SITE_URL}/wp-sitemap.xml`} style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</a>
          <a href={`${SITE_URL}/feed/`} style={{ color: 'inherit', textDecoration: 'none' }}>RSS</a>
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 13 }}>
          {userData ? (
            <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
          ) : (
            <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Log in</Link>
          )}
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--color-divider)' }}>
        <div className="text-muted shell" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 11 }}>
          © {new Date().getFullYear()} Headless Blog — built on WordPress, served without it.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

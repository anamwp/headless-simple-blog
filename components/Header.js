import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { initials } from '@/lib/format';

const Header = () => {
  const router = useRouter();
  const userData = useAuth();
  const isActive = (href) => (router.pathname === href ? 'page' : undefined);

  return (
    <nav className="nav shell" style={{ background: 'var(--color-bg)' }}>
      <Link className="nav-brand" href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
        Headless Blog
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        <Link href="/" aria-current={isActive('/')}>Home</Link>
        <Link href="/category" aria-current={isActive('/category')}>Category</Link>
        <Link href="/tag" aria-current={isActive('/tag')}>Tag</Link>
        <Link href="/search" aria-current={isActive('/search')}>Search</Link>
        {userData ? (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
            <span
              style={{
                width: 28,
                height: 28,
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              {initials(userData.user_display_name || userData.user_nicename)}
            </span>
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link href="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Header;

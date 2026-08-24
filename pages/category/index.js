import useSWR from 'swr';
import { getCategories } from '@/lib/api';
import Link from 'next/link';

export default function Category() {
  const { data: siteCategories, isLoading } = useSWR('categories', getCategories);
  const categories = (siteCategories || []).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <main className="shell" style={{ padding: 'var(--space-8) 0' }}>
      <h1 className="display-64" style={{ fontSize: 64, lineHeight: 0.98, letterSpacing: '-.035em', margin: '0 0 var(--space-6)' }}>Categories</h1>
      <div style={{ height: 2, background: 'var(--color-divider)', marginBottom: 'var(--space-6)' }} />
      {isLoading ? (
        <p className="text-muted">Loading categories…</p>
      ) : (
        <div style={{ borderTop: '1px solid var(--color-divider)' }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-4) 0',
                borderBottom: '1px solid var(--color-divider)',
                textDecoration: 'none',
                color: 'inherit',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              {category.name} <span className="text-muted" style={{ fontWeight: 400, fontSize: 13 }}>{category.count}</span>
            </Link>
          ))}
          {categories.length === 0 && <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>No categories found.</p>}
        </div>
      )}
    </main>
  );
}

import useSWR from 'swr';
import { getTags } from '@/lib/api';
import Link from 'next/link';

export default function Tag() {
  const { data: siteTags, isLoading } = useSWR('tags', getTags);
  const tags = (siteTags || []).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

  return (
    <main className="shell" style={{ padding: 'var(--space-8) 0' }}>
      <h1 className="display-64" style={{ fontSize: 64, lineHeight: 0.98, letterSpacing: '-.035em', margin: '0 0 var(--space-6)' }}>Tags</h1>
      <div style={{ height: 2, background: 'var(--color-divider)', marginBottom: 'var(--space-6)' }} />
      {isLoading ? (
        <p className="text-muted">Loading tags…</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tag/${tag.slug}`} className="tag tag-neutral" style={{ textDecoration: 'none', fontSize: 13, padding: '6px 12px' }}>
              {tag.name} <span className="text-muted" style={{ marginLeft: 6 }}>{tag.count}</span>
            </Link>
          ))}
          {tags.length === 0 && <p className="text-muted">No tags found.</p>}
        </div>
      )}
    </main>
  );
}

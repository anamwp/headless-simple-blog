import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { searchPosts, getTags } from '@/lib/api';
import { getPrimaryCategory, getAuthor } from '@/lib/wp';
import { formatDateShort, excerptText } from '@/lib/format';

export async function getStaticProps() {
  const tags = await getTags();
  const suggestions = tags
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  return { props: { suggestions }, revalidate: 60 };
}

const SearchIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default function SearchPage({ suggestions }) {
  const router = useRouter();
  const urlQuery = typeof router.query.q === 'string' ? router.query.q : '';

  const [input, setInput] = useState(urlQuery);
  const [results, setResults] = useState(null);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInput(urlQuery);
    if (!urlQuery) {
      setResults(null);
      setSearched(false);
      return;
    }
    let isCurrent = true;
    searchPosts(urlQuery).then((res) => {
      if (!isCurrent) return;
      setResults(res.data);
      setTotal(res.totalPosts);
      setSearched(true);
    });
    return () => {
      isCurrent = false;
    };
  }, [urlQuery]);

  const submit = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`, undefined, { shallow: true });
  };

  const runSuggestion = (term) => {
    setInput(term);
    router.push(`/search?q=${encodeURIComponent(term)}`, undefined, { shallow: true });
  };

  const hasResults = searched && results && results.length > 0;
  const noResults = searched && results && results.length === 0;

  return (
    <main className="shell">
      <header style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <h1 className="display-64" style={{ fontSize: 64, lineHeight: 0.98, letterSpacing: '-.035em', margin: '0 0 var(--space-6)' }}>Search</h1>
        <form onSubmit={submit} style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: 640 }}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search posts"
            style={{ minHeight: 48, fontSize: 18 }}
          />
          <button type="submit" className="btn btn-primary" style={{ minHeight: 48, paddingInline: 'var(--space-6)' }}>
            Search
          </button>
        </form>
        {searched && (
          <div className="text-muted" style={{ fontSize: 12, marginTop: 'var(--space-3)' }}>
            {total} {total === 1 ? 'result' : 'results'} for &ldquo;{urlQuery}&rdquo; — searched titles, bodies and tags
          </div>
        )}
        <div style={{ height: 2, background: 'var(--color-divider)', marginTop: 'var(--space-6)' }} />
      </header>

      {hasResults && (
        <div style={{ paddingBottom: 'var(--space-8)' }}>
          {results.map((post) => {
            const category = getPrimaryCategory(post);
            const author = getAuthor(post);
            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="row-3col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr) 200px',
                  gap: 'var(--space-8)',
                  padding: 'var(--space-6) 0',
                  borderBottom: '1px solid var(--color-divider)',
                  textDecoration: 'none',
                  color: 'inherit',
                  alignItems: 'start',
                }}
              >
                <div>
                  {category && (
                    <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
                      {category.name}
                    </span>
                  )}
                  <h2 style={{ margin: 'var(--space-2) 0 0', fontSize: 28, lineHeight: 1.1, letterSpacing: '-.02em' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <p className="text-muted" style={{ margin: 'var(--space-2) 0 0', fontSize: 15, lineHeight: 1.55, maxWidth: '62ch' }}>
                    {excerptText(post.excerpt?.rendered, 30)}
                  </p>
                </div>
                <div className="text-muted" style={{ fontSize: 12, display: 'grid', gap: 'var(--space-1)' }}>
                  <span>{formatDateShort(post.date)}</span>
                  <span>{author.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {noResults && (
        <div className="grid-2" style={{ padding: 'var(--space-8) 0', display: 'grid', gridTemplateColumns: 'minmax(0,560px)', gap: 'var(--space-6)' }}>
          <div>
            <div
              style={{ width: 56, height: 56, border: '2px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}
            >
              <SearchIcon />
            </div>
            <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 36, letterSpacing: '-.025em' }}>Nothing matched that</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: 16, lineHeight: 1.6, maxWidth: '52ch' }}>
              No posts contain that phrase. Search covers post titles, bodies and tags — not comments.
            </p>
          </div>
          {suggestions.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-3)' }}>
                Try instead
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {suggestions.map((tag) => (
                  <button key={tag.id} type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => runSuggestion(tag.name)}>
                    {tag.name}
                  </button>
                ))}
              </div>
              <div style={{ height: 1, background: 'var(--color-divider)', margin: 'var(--space-6) 0' }} />
              <Link href="/" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Back to the front page</Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

import { getPosts } from '@/lib/api';
import { getFeaturedImage, getPrimaryCategory, getAuthor } from '@/lib/wp';
import { formatDateLong, formatDateShort, excerptText } from '@/lib/format';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const POSTS_PER_PAGE = Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE);

export async function getStaticProps() {
  const posts = await getPosts(1, POSTS_PER_PAGE);
  return { props: { posts }, revalidate: 10 };
}

const LeadPost = ({ post }) => {
  if (!post) return null;
  const image = getFeaturedImage(post) || '/assets/placeholder.jpg';
  const category = getPrimaryCategory(post);
  const author = getAuthor(post);

  return (
    <section className="shell">
      <div
        className="grid-2"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)', gap: 'var(--space-8)', padding: 'var(--space-8) 0' }}
      >
        <figure className="grayscale" style={{ margin: 0 }}>
          <Image
            src={image}
            alt={post.title.rendered}
            width={900}
            height={440}
            priority
            sizes="(min-width: 900px) 50vw, 100vw"
            style={{ width: '100%', height: 440, objectFit: 'cover' }}
          />
        </figure>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: 'var(--space-2)' }}>
          {category && (
            <Link href={`/category/${category.slug}`} className="tag tag-accent" style={{ textDecoration: 'none' }}>
              {category.name}
            </Link>
          )}
          <h2
            className="display-52"
            style={{ fontSize: 52, lineHeight: 1.02, letterSpacing: '-.025em', margin: 'var(--space-4) 0 var(--space-4)' }}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '46ch' }}>{excerptText(post.excerpt?.rendered, 55)}</p>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
            {author.name} — {formatDateLong(post.date)} — {post.readTime}
          </div>
          <Link href={`/posts/${post.slug}`} className="btn btn-primary" style={{ marginTop: 'var(--space-3)', textDecoration: 'none' }}>
            Read the note
          </Link>
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--color-divider)' }} />
    </section>
  );
};

const LatestGrid = ({ posts }) => {
  if (posts.length === 0) return null;
  const cellPadding = [
    'var(--space-6) var(--space-6) var(--space-8) 0',
    'var(--space-6)',
    'var(--space-6) 0 var(--space-8) var(--space-6)',
  ];

  return (
    <section className="shell">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: 'var(--space-6) 0 var(--space-4)' }}>
        <h3 style={{ margin: 0, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>Latest</h3>
      </div>
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--color-divider)' }}>
        {posts.map((post, i) => {
          const category = getPrimaryCategory(post);
          const author = getAuthor(post);
          return (
            <article
              key={post.id}
              style={{
                padding: cellPadding[i],
                borderRight: i < 2 ? '1px solid var(--color-divider)' : undefined,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
              }}
            >
              {category && (
                <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
                  {category.name}
                </span>
              )}
              <h4 style={{ margin: 0, fontSize: 26, lineHeight: 1.1, letterSpacing: '-.02em' }}>
                <Link href={`/posts/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </h4>
              <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{excerptText(post.excerpt?.rendered, 22)}</p>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 'auto' }}>
                {author.name} — {formatDateShort(post.date)} — {post.readTime}
              </div>
            </article>
          );
        })}
      </div>
      <div style={{ height: 2, background: 'var(--color-divider)' }} />
    </section>
  );
};

const EarlierList = ({ posts, onShowMore, loading, hasMore }) => {
  if (posts.length === 0) return null;
  return (
    <section className="shell" style={{ padding: 'var(--space-6) var(--space-8) 0' }}>
      <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>Earlier</h3>
      <div style={{ borderTop: '1px solid var(--color-divider)' }}>
        {posts.map((post) => {
          const category = getPrimaryCategory(post);
          return (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="row-3col"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px minmax(0,1fr) 160px',
                gap: 'var(--space-6)',
                alignItems: 'baseline',
                padding: 'var(--space-4) 0',
                borderBottom: '1px solid var(--color-divider)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span className="text-muted" style={{ fontSize: 12 }}>{formatDateShort(post.date)}</span>
              <span
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, letterSpacing: '-.015em' }}
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              <span className="text-muted" style={{ fontSize: 12 }}>{category ? category.name : ''}</span>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <button type="button" className="btn btn-secondary" style={{ marginTop: 'var(--space-6)' }} onClick={onShowMore} disabled={loading}>
          {loading ? 'Loading…' : 'Show more posts'}
        </button>
      )}
    </section>
  );
};

const Home = ({ posts }) => {
  const [sitePosts, setSitePosts] = useState(posts.data);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(posts.data.length < posts.totalPosts);

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getPosts(page, POSTS_PER_PAGE);
      setSitePosts((prev) => [...prev, ...response.data]);
      setPage((prev) => prev + 1);
      if (response.data.length < POSTS_PER_PAGE || sitePosts.length + response.data.length >= response.totalPosts) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const [lead, ...rest] = sitePosts;
  const latest = rest.slice(0, 3);
  const earlier = rest.slice(3);

  return (
    <>
      <header className="shell" style={{ padding: 'var(--space-8) var(--space-8) 0' }}>
        <div
          className="grid-2"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 'var(--space-8)', alignItems: 'end', paddingBottom: 'var(--space-6)' }}
        >
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
              Decoupled WordPress, in practice
            </div>
            <h1 className="display-84" style={{ fontSize: 84, lineHeight: 0.92, letterSpacing: '-.035em', margin: 'var(--space-4) 0 0' }}>
              Notes from<br />the front end
            </h1>
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-1)', fontSize: 12 }}>
            <div className="text-muted">Updated {formatDateLong(new Date())}</div>
            <div className="text-muted">{posts.totalPosts} posts in the archive</div>
            <div>Notes on running a WordPress backend without its front end.</div>
          </div>
        </div>
        <div style={{ height: 2, background: 'var(--color-divider)' }} />
      </header>

      <LeadPost post={lead} />
      <LatestGrid posts={latest} />
      <EarlierList posts={earlier} onShowMore={fetchPosts} loading={loading} hasMore={hasMore} />
    </>
  );
};

export default Home;

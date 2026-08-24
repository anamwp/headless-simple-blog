import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { getComments, getCategoriesByIds, getPostBySlug, getPostSlugs, getTagsByIds } from '@/lib/api';
import { getAuthor, getFeaturedImage, getFeaturedMedia, getPrimaryCategory } from '@/lib/wp';
import { formatDateLong, initials, readingTime, stripHtml } from '@/lib/format';
import { extractHeadings } from '@/lib/content';
import { isSaved, toggleSaved } from '@/lib/engagement';
import { useAuth } from '@/lib/useAuth';
import CommentForm from '@/components/CommentForm';
import CommentThread from '@/components/CommentThread';

export async function getStaticPaths() {
  const posts = await getPostSlugs(10); // Adjust as needed for large sites
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: 'blocking' }; // Generate pages on-demand if not pre-built
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return { notFound: true }; // 404 if the post doesn't exist
    }

    const [categories, tags, comments] = await Promise.all([
      getCategoriesByIds(post.categories),
      getTagsByIds(post.tags),
      getComments(post.id),
    ]);

    const { html: bodyHtml, headings } = extractHeadings(post.content.rendered);

    return {
      props: {
        post,
        categories,
        tags,
        comments,
        bodyHtml,
        headings,
      },
      revalidate: 10, // Revalidate every 10 seconds
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { notFound: true };
  }
}

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };
  return (
    <button type="button" className="btn btn-secondary btn-icon" aria-label="Copy link" onClick={onClick} title={copied ? 'Copied!' : 'Copy link'}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </button>
  );
};

const SaveButton = ({ postId }) => {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(isSaved(postId)), [postId]);
  return (
    <button
      type="button"
      className="btn btn-secondary btn-icon"
      aria-label="Save post"
      aria-pressed={saved}
      onClick={() => setSaved(toggleSaved(postId))}
      style={saved ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' } : undefined}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
  );
};

const PostPage = ({ post, categories, tags, comments: initialComments, bodyHtml, headings }) => {
  const router = useRouter();
  const userData = useAuth();
  const authed = Boolean(userData);

  const [comments, setComments] = useState(initialComments);
  const [sort, setSort] = useState('newest');
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [ownIds, setOwnIds] = useState(() => new Set());
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setComments(initialComments);
    setPendingIds(new Set());
    setOwnIds(new Set());
    setNotice(null);
  }, [post.id, initialComments]);

  if (router.isFallback) {
    return <p className="shell text-muted" style={{ padding: 'var(--space-8)' }}>Loading…</p>;
  }

  const featuredMedia = getFeaturedMedia(post);
  const featuredImage = getFeaturedImage(post) || '/assets/placeholder.jpg';
  const category = getPrimaryCategory(post);
  const author = getAuthor(post);
  const publicComments = comments.filter((c) => !pendingIds.has(c.id));
  const commentCount = publicComments.length + [...pendingIds].length;

  const rootComments = useMemo(() => {
    const list = comments.filter((c) => c.parent === 0);
    return list.slice().sort((a, b) => (sort === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));
  }, [comments, sort]);

  const repliesByRoot = useMemo(() => {
    const byId = new Map(comments.map((c) => [c.id, c]));
    const map = new Map();
    comments
      .filter((c) => c.parent !== 0)
      .forEach((reply) => {
        let rootId = reply.parent;
        let guard = 0;
        while (byId.has(rootId) && byId.get(rootId).parent !== 0 && guard < 10) {
          rootId = byId.get(rootId).parent;
          guard += 1;
        }
        if (!map.has(rootId)) map.set(rootId, []);
        map.get(rootId).push(reply);
      });
    map.forEach((list) => list.sort((a, b) => new Date(a.date) - new Date(b.date)));
    return map;
  }, [comments]);

  const handleTopLevelSubmitted = (data, meta) => {
    if (meta?.error) {
      setNotice('Failed to submit comment. Please try again.');
      return;
    }
    if (data) {
      setComments((prev) => [...prev, data]);
      setOwnIds((prev) => new Set(prev).add(data.id));
      if (meta?.held) {
        setPendingIds((prev) => new Set(prev).add(data.id));
        setNotice('Comment submitted — held for moderation.');
      } else {
        setNotice('Comment posted.');
      }
    }
  };

  const handleReplySubmitted = (parentId, data, meta) => {
    if (meta?.error) {
      setNotice('Failed to submit reply. Please try again.');
      return;
    }
    if (data) {
      setComments((prev) => [...prev, data]);
      setOwnIds((prev) => new Set(prev).add(data.id));
      if (meta?.held) {
        setPendingIds((prev) => new Set(prev).add(data.id));
        setNotice('Reply submitted — held for moderation.');
      } else {
        setNotice('Reply posted.');
      }
    }
  };

  return (
    <main className="shell">
      <header style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        {category && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Link href={`/category/${category.slug}`} className="tag tag-accent" style={{ textDecoration: 'none' }}>
              {category.name}
            </Link>
          </div>
        )}
        <h1
          className="display-72"
          style={{ fontSize: 72, lineHeight: 0.96, letterSpacing: '-.035em', margin: 0, maxWidth: '16ch' }}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div
          className="grid-2"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'var(--space-6)', alignItems: 'end', marginTop: 'var(--space-8)', paddingBottom: 'var(--space-3)' }}
        >
          <p style={{ margin: 0, fontSize: 20, lineHeight: 1.5, maxWidth: '60ch' }}>{stripHtml(post.excerpt?.rendered)}</p>
          <div className="text-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {author.name} — {formatDateLong(post.date)} — {readingTime(post.content?.rendered)} read
          </div>
        </div>
        <div style={{ height: 2, background: 'var(--color-divider)' }} />
      </header>

      <figure className="grayscale" style={{ margin: '0 0 var(--space-8)' }}>
        <Image
          src={featuredImage}
          alt={post.title.rendered}
          width={1360}
          height={480}
          priority
          sizes="(min-width: 900px) 900px, 100vw"
          style={{ width: '100%', height: 480, objectFit: 'cover' }}
        />
        {featuredMedia?.caption?.rendered && (
          <figcaption>{stripHtml(featuredMedia.caption.rendered)}</figcaption>
        )}
      </figure>

      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,680px)', gap: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <aside className="sticky-rail" style={{ display: 'grid', gap: 'var(--space-6)', alignContent: 'start' }}>
          {tags.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-2)' }}>
                Filed under
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`} className="tag tag-outline" style={{ textDecoration: 'none' }}>
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {headings.length > 0 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-2)' }}>
                In this note
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 13 }}>
                {headings.map((h, i) => (
                  <a key={h.id} href={`#${h.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {String(i + 1).padStart(2, '0')}  {h.text}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 'var(--space-2)' }}>
              Share
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <CopyLinkButton />
              {authed && <SaveButton postId={post.id} />}
            </div>
          </div>
        </aside>

        <article className="post-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>

      {/* author bio */}
      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,680px)', gap: 'var(--space-8)', paddingBottom: 'var(--space-8)', marginTop: 'calc(-1 * var(--space-8))' }}>
        <div />
        <div>
          <div style={{ height: 2, background: 'var(--color-divider)', margin: '0 0 var(--space-6)' }} />
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <span
              style={{ width: 56, height: 56, flex: 'none', background: 'var(--color-neutral-900)', color: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}
            >
              {initials(author.name)}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>{author.name}</div>
              {author.description && (
                <p className="text-muted" style={{ margin: 'var(--space-1) 0 0', fontSize: 14, maxWidth: '52ch' }}>{author.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section id="comments" style={{ borderTop: '2px solid var(--color-divider)', padding: 'var(--space-8) 0 0' }}>
        <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,680px)', gap: 'var(--space-8)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>Discussion</h2>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 'var(--space-2)' }}>{commentCount} comments</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', paddingBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0, fontSize: 28, letterSpacing: '-.02em' }}>Join the discussion</h3>
              <div className="seg" role="radiogroup" aria-label="Sort comments">
                <label className="seg-opt">
                  <input type="radio" name="csort" checked={sort === 'newest'} onChange={() => setSort('newest')} />
                  Newest
                </label>
                <label className="seg-opt">
                  <input type="radio" name="csort" checked={sort === 'oldest'} onChange={() => setSort('oldest')} />
                  Oldest
                </label>
              </div>
            </div>

            {notice && (
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 'var(--space-3)' }}>{notice}</p>
            )}

            {authed ? (
              <CommentForm variant="member" postId={post.id} userData={userData} onSubmitted={handleTopLevelSubmitted} />
            ) : (
              <CommentForm variant="guest" postId={post.id} onSubmitted={handleTopLevelSubmitted} />
            )}

            <div style={{ marginTop: 'var(--space-8)' }}>
              {rootComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  replies={repliesByRoot.get(comment.id) || []}
                  postId={post.id}
                  postAuthorId={post.author}
                  authed={authed}
                  userData={userData}
                  isOwn={(id) => ownIds.has(id)}
                  isPending={(id) => pendingIds.has(id)}
                  onReplySubmitted={handleReplySubmitted}
                />
              ))}
              {rootComments.length === 0 && (
                <p className="text-muted" style={{ padding: 'var(--space-6) 0' }}>No comments yet — be the first.</p>
              )}
            </div>

            {!authed && (
              <div style={{ borderTop: '1px solid var(--color-divider)', padding: 'var(--space-6) 0 var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <span className="text-muted" style={{ fontSize: 14 }}>Members can reply, react and edit their own comments.</span>
                <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Log in</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PostPage;

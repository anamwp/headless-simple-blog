import { useRouter } from 'next/router';
import { getCategories, getTags, getTagBySlug, getPostsByTag } from '@/lib/api';
import ArchiveTemplate from '@/components/ArchiveTemplate';

const POSTS_PER_PAGE = Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE);

export async function getStaticPaths() {
  const tags = await getTags();
  const paths = tags.map((tag) => ({ params: { slug: tag.slug } }));

  return {
    paths,
    // Navigate to not-yet-built tag pages immediately with a placeholder,
    // instead of blocking the URL change on the full fetch.
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const tag = await getTagBySlug(slug);

    if (!tag) {
      return { notFound: true };
    }

    const [postsPage, categories, tags] = await Promise.all([
      getPostsByTag(tag.id, 1, POSTS_PER_PAGE),
      getCategories(),
      getTags(),
    ]);

    const railCategories = categories
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const railTags = tags
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      props: {
        tag,
        initialPosts: postsPage.data,
        initialTotal: postsPage.totalPosts,
        categories: railCategories,
        tags: railTags,
      },
      revalidate: 10,
    };
  } catch (error) {
    console.error('Error fetching tag or posts:', error);
    return { notFound: true };
  }
}

const TagPage = ({ tag, initialPosts, initialTotal, categories, tags }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <p className="shell text-muted" style={{ padding: 'var(--space-8)' }}>Loading tag…</p>;
  }

  return (
    <ArchiveTemplate
      kind="Tag"
      term={tag}
      initialPosts={initialPosts}
      initialTotal={initialTotal}
      categories={categories}
      tags={tags}
    />
  );
};

export default TagPage;

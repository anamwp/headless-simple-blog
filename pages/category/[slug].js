import { useRouter } from 'next/router';
import { getCategories, getCategoryBySlug, getPostsByCategory, getTags } from '@/lib/api';
import ArchiveTemplate from '@/components/ArchiveTemplate';

const POSTS_PER_PAGE = Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE);

export async function getStaticPaths() {
  const categories = await getCategories();
  const paths = categories.map((category) => ({ params: { slug: category.slug } }));

  return {
    paths,
    // Navigate to not-yet-built category pages immediately with a
    // placeholder, instead of blocking the URL change on the full fetch.
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return { notFound: true };
    }

    const [postsPage, categories, tags] = await Promise.all([
      getPostsByCategory(category.id, 1, POSTS_PER_PAGE),
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
        category,
        initialPosts: postsPage.data,
        initialTotal: postsPage.totalPosts,
        categories: railCategories,
        tags: railTags,
      },
      revalidate: 10,
    };
  } catch (error) {
    console.error('Error fetching category or posts:', error);
    return { notFound: true };
  }
}

const CategoryPage = ({ category, initialPosts, initialTotal, categories, tags }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <p className="shell text-muted" style={{ padding: 'var(--space-8)' }}>Loading category…</p>;
  }

  return (
    <ArchiveTemplate
      kind="Category"
      term={category}
      initialPosts={initialPosts}
      initialTotal={initialTotal}
      categories={categories}
      tags={tags}
    />
  );
};

export default CategoryPage;

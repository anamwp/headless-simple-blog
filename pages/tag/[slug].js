import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getTags, getTagBySlug, getPostsByTag } from '@/lib/api';

export async function getStaticPaths() {
  // Fetch all tags
  const tags = await getTags();

  // Create paths for each tag
  const paths = tags.map((tag) => ({
    params: { slug: tag.slug },
  }));

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

    const posts = await getPostsByTag(tag.id);

    return {
      props: {
        tag,
        posts,
      },
      revalidate: 10, // Revalidate every 10 seconds, in step with the post/category pages
    };
  } catch (error) {
    console.error('Error fetching tag or posts:', error);
    return { notFound: true };
  }
}

const TagPage = ({ tag, posts }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className='container max-w-screen-md mx-auto my-10'>
        <p>Loading tag...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className='text-2xl my-5 font-medium'>Tag: {tag.name}</h2>
      <ul className='grid grid-cols-1 gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {posts.map((post) => {
          const featuredImage = post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : null;
          return (
            <li key={post.id} className='mb-1'>
              <Link className='text-slate-600 text-base hover:text-slate-950 overflow-hidden block rounded-md' href={`/posts/${post.slug}`}>
                {
                  featuredImage && (
                    <Image
                      width={900}
                      height={600}
                      src={featuredImage}
                      alt={post.title.rendered}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className='w-full h-auto object-cover rounded-md hover:scale-125 transition-all duration-300'
                    />
                  )
                }
              </Link>
            <Link className="inline-block capitalize text-slate-600 text-base hover:text-slate-950" href={`/posts/${post.slug}`}>{post.title.rendered}</Link>
          </li>
          )
        })}
      </ul>
    </div>
  );
};

export default TagPage;

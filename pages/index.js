import { getPosts } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const POSTS_PER_PAGE = Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE);

export async function getStaticProps() {
  const posts = await getPosts(1, POSTS_PER_PAGE);
  return { props: { posts } };
}

const RenderData = ( posts ) => {
  return posts.data.map((post) => {
    const featuredImageUrl = post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : null;
    return (
      <li key={post.id} className='mb-2'>
        <Link className='text-slate-600 text-base hover:text-slate-950 overflow-hidden block rounded-md' href={`/posts/${post.slug}`}>
          {
            featuredImageUrl && (
              <Image
                width={900}
                height={600}
                src={featuredImageUrl}
                alt={post.title.rendered}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className='w-full h-auto object-cover rounded-md hover:scale-125 transition-all duration-300'
              />
            )
          }
        </Link>
        <Link className='text-lg mt-3 inline-block leading-tight text-slate-600 text-base hover:text-slate-950' href={`/posts/${post.slug}`}>{post.title.rendered}</Link>
      </li>
    )
  });
}


const Home = ({ posts }) => {

  const [sitePosts, setSitePosts] = useState(posts.data); // Seeded from getStaticProps, no refetch needed
  const [page, setPage] = useState(2); // Page 1 already loaded via getStaticProps
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMore, setHasMore] = useState(posts.data.length < posts.totalPosts); // If more posts exist

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getPosts(page, POSTS_PER_PAGE);
      const postData = response.data;

      setSitePosts((prevPosts) => [...prevPosts, ...postData]);
      setPage((prevPage) => prevPage + 1);

      if (postData.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className='text-xl font-medium mb-5'>Blog Posts</h1>
      <ul className='grid grid-cols-1 gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 '>
        <RenderData data={sitePosts} />
      </ul>
      {hasMore ? (
        <div className='mt-10 text-center'>
          <button className="px-5 py-2 border-2 border-slate-500 rounded-sm hover:bg-black hover:text-white hover:border-black transition-all" onClick={fetchPosts} disabled={loading}>
            {loading ? 'Loading...' : 'Show more posts'}
          </button>
        </div>
      ) : (
        <p>No more posts to load.</p>
      )}
    </div>
  )
};

export default Home;

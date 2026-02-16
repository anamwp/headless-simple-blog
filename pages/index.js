import { getPosts } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export async function getStaticProps() {
  const posts = await getPosts(1, 10);
  // console.warn('get static props', posts);
  return { props: { posts } };
}

const RenderData = ( posts ) => {
  // console.log('featured image', featuredImageUrl);
  return posts.data.map((post) => {
    const featuredImageUrl = post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : null;
    // console.log('featured image', featuredImageUrl);
    return (
      <li key={post.id} className='mb-2'>
        <Link className='text-slate-600 text-base hover:text-slate-950 overflow-hidden inline-block rounded-md' href={`/posts/${post.slug}`}>
          {
            featuredImageUrl && <Image width={900} height={600} src={featuredImageUrl} alt={post.title.rendered} className='w-auto h-auto object-cover rounded-md hover:scale-125 transition-all duration-300' />
          }
        </Link>
        <Link className='text-lg mt-3 inline-block leading-tight text-slate-600 text-base hover:text-slate-950' href={`/posts/${post.slug}`}>{post.title.rendered}</Link>
      </li>
    )
  });
}


const Home = () => {

  const [sitePosts, setSitePosts] = useState([]); // Store fetched posts
  const [page, setPage] = useState(1); // Current page
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMore, setHasMore] = useState(true); // If more posts exist

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getPosts(page, process.env.NEXT_PUBLIC_POSTS_PER_PAGE);
      // console.log('response', response);
      const postData = response.data;
      const totalPosts = response.totalPosts;

      setSitePosts((prevPosts) => [...prevPosts, ...postData]);
      setPage((prevPage) => prevPage + 1);
      
      if( postData ){
        if (postData.length < process.env.NEXT_PUBLIC_POSTS_PER_PAGE){
          setHasMore(false);
        }else if( totalPosts == process.env.NEXT_PUBLIC_POSTS_PER_PAGE ){
          setHasMore(false)
        }
      }

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(); // Load initial posts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  
  // console.log('sitePosts', sitePosts);
  // console.log('get static props', sitePosts);
  // sitePosts.map((post) => {
  //   console.log('post', post.title.rendered);
  // })
  return (
    <div>
      <h1 className='text-xl font-medium mb-5'>Blog Posts</h1>
      <ul className='grid grid-cols-1 gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 '>
        <RenderData data={sitePosts} />
      </ul>
      {/* <ul>
        {sitePosts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.slug}`}>{post.title.rendered}</Link>
          </li>
        ))}
      </ul> */}
      {hasMore && (
        <div className='mt-10 text-center'>
          <button className="px-5 py-2 border-2 border-slate-500 rounded-sm hover:bg-black hover:text-white hover:border-black transition-all" onClick={fetchPosts} disabled={loading}>
            {loading ? 'Loading...' : 'Show more posts'}
          </button>
        </div>
      )}
      {!hasMore && <p>No more posts to load.</p>}
    </div>
  )
};

export default Home;
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommentsView from '../../components/Comment';
import CommentForm from '../../components/CommentForm';
import { getComments, getCategoriesByIds, getPostBySlug, getPostSlugs, getRelatedPosts, getTagsByIds } from '@/lib/api';

export async function getStaticPaths() {
  const posts = await getPostSlugs(10); // Adjust as needed for large sites
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: 'blocking' }; // Generate pages on-demand if not pre-built
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  const post = await getPostBySlug(slug);

  if (!post) {
    return { notFound: true }; // 404 if the post doesn't exist
  }

  // These four requests only depend on `post`, not on each other — fetch them together.
  const [relatedPosts, categories, tags, comments] = await Promise.all([
    getRelatedPosts(post.categories[0], post.id, 3),
    getCategoriesByIds(post.categories),
    getTagsByIds(post.tags),
    getComments(post.id),
  ]);

  return {
    props: {
      post,
      relatedPosts,
      categories,
      tags,
      comments,
    },
    revalidate: 10, // Revalidate every 10 seconds
  };
}

const PostPage = ({ post, relatedPosts, categories, tags, comments }) => {
  const router = useRouter();
  const [parentId, setParentId] = useState(0);
  const [replyMessage, setReplyMessage] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Reset the reply/submit UI whenever the visitor lands on a different post
  useEffect(() => {
    setParentId(0);
    setReplyMessage(null);
    setSubmitStatus(null);
  }, [post.id]);

  // Warm the category/tag pages this post links to, so a click on one of
  // them opens instantly instead of waiting on a cold fallback:true fetch.
  // Delayed so it doesn't compete with this page's own initial load, and
  // scoped to just this post's own categories/tags (not the whole site).
  useEffect(() => {
    const timer = setTimeout(() => {
      categories.forEach((category) => router.prefetch(`/category/${category.slug}`));
      tags.forEach((tag) => router.prefetch(`/tag/${tag.slug}`));
    }, 1500);
    return () => clearTimeout(timer);
  }, [post.id, categories, tags, router]);

  const featuredImage = post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : null;

  const addReply = (commentId, commentHtml) => {
    setParentId(commentId);
    setReplyMessage(commentHtml);
  };

  return (
    <div className="container max-w-screen-md mx-auto my-10 inline-block">
		{/* Back link */}
		<Link className='inline-block px-5 py-2 mb-5 border-2 border-slate-500 rounded-sm hover:bg-black hover:text-white hover:border-black transition-all' href="/">Back</Link>
		{/* Title */}
		<h2 className='text-2xl my-5 font-medium mb-2'>{post.title.rendered}</h2>
		{/* Meta */}
		<div className="meta flex align-middle justify-between">
			{/* author */}
			<span className='text-sm text-slate-600'>By {post._embedded.author[0].name}</span>
			{/* date */}
			<span className='text-sm text-slate-600'>Published on {new Date(post.date).toDateString()}</span>
		</div>
		{/* show featured image */}
		{
			featuredImage && (
				<Image
					width={900}
					height={600}
					src={featuredImage}
					alt={post.title.rendered}
					priority
					sizes="(min-width: 768px) 768px, 100vw"
					className='mt-7 w-full h-auto mb-5 object-cover rounded-md'
				/>
			)
		}
		{/* Content */}
		<div className='flex flex-col gap-5' dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
		{/* Categories */}
		<h2 className='text-2xl my-5 font-medium mt-10'>Categories</h2>
		<ul className='flex flex-wrap gap-2'>
			{categories.map((category) => (
			<li key={category.id}>
				<Link className='bg-slate-200 px-3 py-1 rounded-md hover:bg-slate-300 transition-all capitalize text-sm' href={`/category/${category.slug}`}>
				{category.name}
				</Link>
			</li>
			))}
		</ul>
  		{/* Tags */}
		<h2 className='text-2xl my-5 font-medium mt-10'>Tags</h2>
		<ul className='flex flex-wrap gap-2'>
			{tags.map((tag) => (
			<li key={tag.id}>
				<Link className='bg-slate-200 px-3 py-1 rounded-md hover:bg-slate-300 transition-all capitalize text-sm' href={`/tag/${tag.slug}`}>
				{tag.name}
				</Link>
			</li>
			))}
		</ul>
		{/* Comments */}
		<div>
			<CommentsView comments={comments} addReply={addReply} />
            <div id="comment-form-wrapper">
                <h2 className='text-2xl my-5 font-medium mt-10'>Leave a Comment</h2>
                <div className='flex flex-col gap-3'>
                    {submitStatus && (
                        <p className="comment-submit-status bg-green-200 flex gap-3 p-5 inline-block w-full rounded mb-5">{submitStatus}</p>
                    )}
                    {replyMessage && (
                        <div className="reply-to-comment-message bg-slate-200 flex gap-3 p-5 inline-block w-full rounded">
                            <strong>Replying to comment:</strong>&nbsp;<span dangerouslySetInnerHTML={{ __html: replyMessage }} />
                        </div>
                    )}
                </div>
			    <CommentForm postId={post.id} parentId={parentId} onSubmitted={setSubmitStatus} />
            </div>
		</div>
		{/* Related Posts */}
		{ relatedPosts.length > 0 ? (
		<div className='mt-10'>
			<h2 className='text-2xl my-5 font-medium'>Related Posts</h2>
			<ul className='grid grid-cols-3 gap-5'>
			{relatedPosts.map((relatedPost) => {
				const relatedFeaturedImage = relatedPost._embedded['wp:featuredmedia'] ? relatedPost._embedded['wp:featuredmedia'][0].source_url : null;
				return (
				<li key={relatedPost.id} className='mb-1'>
					<Link className='overflow-hidden block rounded-md' href={`/posts/${relatedPost.slug}`}>
					{
					relatedFeaturedImage && (
						<Image
							width={900}
							height={600}
							src={relatedFeaturedImage}
							alt={relatedPost.title.rendered}
							sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
							className='w-full h-auto object-cover rounded-md hover:scale-125 transition-all duration-300'
						/>
					)
					}
					</Link>
					<Link className='text-lg mt-3 inline-block leading-tight text-slate-600 text-base hover:text-slate-950' href={`/posts/${relatedPost.slug}`}>{relatedPost.title.rendered}</Link>
				</li>
				)
			})}
			</ul>
      	</div>
      	) : null }

    </div>
  );
}

export default PostPage;

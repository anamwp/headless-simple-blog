import React, {useEffect} from 'react';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';


const Comment = ({ comment, comments, addReply }) => {
	/**
	 * This useEffect will remove the reply message and comment submit status message when user navigates to another page.
	 */
	const router = useRouter();
	useEffect(() => {
		const handleRouteChange = () => {
			const replyMessageElement = document.querySelector('.reply-to-comment-message');
			if (replyMessageElement) {
				replyMessageElement.classList.remove( 'bg-slate-200', 'flex', 'gap-3', 'p-5', 'inline-block', 'w-full', 'rounded' );
				replyMessageElement.innerHTML = ''; // Reset content
			}
			const commentSubmitStatusDom = document.querySelector('.comment-submit-status');
			if(commentSubmitStatusDom){
				commentSubmitStatusDom.classList.remove('bg-green-200', 'flex', 'gap-3', 'p-5', 'inline-block', 'w-full', 'rounded', 'mb-5');
				commentSubmitStatusDom.innerHTML = '';
			}
		};
		// alert('Comment.js');
	
		router.events.on('routeChangeStart', handleRouteChange);
	
		// Cleanup listener on component unmount
		return () => {
		  router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events]);
	

	// filter rootCommnets and find out children comments
	const childComments = comments.filter(c => c.parent === comment.id);

	return (
		<div className={`rounded ${comment.parent ? 'bg-white p-2 px-3 mb-2' : 'bg-gray-100 p-5 mb-5'}`} style={{ marginLeft: comment.parent ? '20px' : '0px', border: '1px solid #ddd' }}>
			<div data-comment-id={comment.id} className='flex justify-between items-start'>
				<div className="comment-content flex flex-col items-start">
					<strong className="capitalize">{comment.author_name}</strong>
                                       <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(comment.content.rendered)}} />
				</div>
				<button
					className="text-black text-sm mt-2 font-medium hover:text-slate-500"
					onClick={() => {
						const element = document.getElementById('comment-form-wrapper');
						if (element) {
						  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}
						const replyMessageElement = document.querySelector('.reply-to-comment-message');
						const commentSubmitStatusDom = document.querySelector('.comment-submit-status');
						if(commentSubmitStatusDom){
							commentSubmitStatusDom.innerHTML = '';
							commentSubmitStatusDom.classList.remove('bg-green-200', 'flex', 'gap-3', 'p-5', 'inline-block', 'w-full', 'rounded', 'mb-5');
						}
						if (replyMessageElement) {
							replyMessageElement.classList.add('bg-slate-200', 'flex', 'gap-3', 'p-5', 'inline-block', 'w-full', 'rounded');
                                                        replyMessageElement.innerHTML = `<strong>Replying to comment:</strong> ${DOMPurify.sanitize(comment.content.rendered)}`;
						}

						addReply(comment.id)
					}}
				>
					Reply
				</button>
			</div>
			{childComments.length > 0 && (
				<div className='ml-5 mt-3'>
					{childComments.map(childComment => (
						<Comment key={childComment.id} comment={childComment} comments={comments} addReply={addReply} />
					))}
				</div>
			)}
		</div>
	);
};

const CommentsView = ({ comments, addReply }) => {
	// Find out parent comments
	const rootComments = comments.filter(comment => comment.parent === 0);

	return (
		<div>
		<h2 className='text-2xl my-5 font-medium mt-10'>Comments</h2>
		{/* Loop through parent comment and show accordingly */}
		{rootComments.map(comment => (
			<Comment key={comment.id} comment={comment} comments={comments} addReply={addReply} />
		))}
		</div>
	);
};

export default CommentsView;
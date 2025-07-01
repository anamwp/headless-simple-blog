import React, { useState } from 'react';
import axios from 'axios';
import UserData from './UserData';

const CommentForm = ({ postId, parentId = 0 }) => {
	const [authorName, setAuthorName] = useState('');
	const [authorEmail, setAuthorEmail] = useState('');
	const [content, setContent] = useState('');
	const userData = UserData();
	
	const handleSubmit = async (e) => {
		let name = authorName;
    	let email = authorEmail;

		if( userData && userData.token ){
			name = userData.user_nicename;
			email = userData.user_email;
		}

		e.preventDefault();
		try {
			// console.log( 'CommentForm.handleSubmit', userData );
			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
				post: postId,	
				parent: parentId,
				// author_name: authorName,
				// author_email: authorEmail,
				author_name: name,
				author_email: email,
				content,
			});

			if( response.status === 201 ){
				if( !userData || !userData.token ){
					setAuthorName('');
					setAuthorEmail('');
				}
				setContent('');
				// add message to user
				const commentSubmitStatusDom = document.querySelector('.comment-submit-status');
				commentSubmitStatusDom.classList.add('bg-green-200', 'flex', 'gap-3', 'p-5', 'inline-block', 'w-full', 'rounded', 'mb-5');
				commentSubmitStatusDom.innerHTML = 'Comment submitted successfully. Please wait for approval.';
			}
			// Optionally refresh comments
		} catch (error) {
			console.error('Failed to submit comment:', error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5 items-start">
			<textarea
				placeholder="Your comment"
				value={content}
				className='rounded border border-1 border-gray-300 block w-full p-3'
				onChange={(e) => setContent(e.target.value)}
				required
			/>
			{
				!userData || !userData.token ? 
					<>
						<input
							type="text"
							placeholder="Your name"
							value={authorName}
							className='rounded border border-1 border-gray-300 block w-full p-3'
							onChange={(e) => setAuthorName(e.target.value)}
							required
						/>
						<input
							type="email"
							placeholder="Your email"
							value={authorEmail}
							className='rounded border border-1 border-gray-300 block w-full p-3'
							onChange={(e) => setAuthorEmail(e.target.value)}
							required
						/>
					</>
				: null
			}
			
			<button className='inline-block px-5 py-2 mb-5 border-2 border-slate-500 rounded-sm hover:bg-black hover:text-white hover:border-black transition-all' type="submit">Submit</button>
		</form>
	);
};

export default CommentForm;
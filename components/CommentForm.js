import React, { useState } from 'react';
import { submitComment } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

const CommentForm = ({ postId, parentId = 0, onSubmitted }) => {
	const [authorName, setAuthorName] = useState('');
	const [authorEmail, setAuthorEmail] = useState('');
	const [content, setContent] = useState('');
	const userData = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		let name = authorName;
		let email = authorEmail;

		if( userData && userData.token ){
			name = userData.user_nicename;
			email = userData.user_email;
		}

		try {
			const response = await submitComment({ postId, parentId, authorName: name, authorEmail: email, content });
			if( response.status === 201 ){
				if( !userData || !userData.token ){
					setAuthorName('');
					setAuthorEmail('');
				}
				setContent('');
				onSubmitted?.('Comment submitted successfully. Please wait for approval.');
			}
			// Optionally refresh comments
		} catch (error) {
			console.error('Failed to submit comment:', error);
			onSubmitted?.('Failed to submit comment. Please try again.');
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

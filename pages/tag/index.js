
import { useEffect, useState } from 'react';
import { getTags } from '@/lib/api';
import Link from 'next/link';


export default function Tag() {

	const [loading, setLoading] = useState(false); // Loading state for button
	const [siteTags, setSiteTags] = useState([]); // Store fetched categories


	useEffect(() => {
		fetchTags();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchTags = async () => {
		if (loading) return;
		setLoading(true);
		try {
		  const response = await getTags();
		  if (response.length < 1){
			setSiteTags([]);
		  }else{
			setSiteTags(response);
		  }
		} catch (error) {
		  console.error('Error fetching tags:', error);
		} finally {
		  setLoading(false);
		}
	}



	return (
		<div className='container max-w-screen-md mx-auto my-10 inline-block'>
			<h2 className='text-2xl my-5 font-medium'>Tags</h2>
			<p>{ siteTags.length < 1 ? 'No tags found' : '' }</p>
			{
				loading ? 'Loading tags...' : (
					siteTags && <ul>
						{siteTags.map((tag) => (
							<li className='mb-1' key={tag.id}>
								<Link className='capitalize text-slate-600 text-base hover:text-slate-950' href={`/tag/${tag.slug}`}>
									{tag.name}
								</Link>
							</li>
						))}
					</ul>
				)
			}
		</div>
	);
}
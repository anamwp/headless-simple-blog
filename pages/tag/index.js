import useSWR from 'swr';
import { getTags } from '@/lib/api';
import Link from 'next/link';

export default function Tag() {
	const { data: siteTags, isLoading } = useSWR('tags', getTags);

	return (
		<div className='container max-w-screen-md mx-auto my-10 inline-block'>
			<h2 className='text-2xl my-5 font-medium'>Tags</h2>
			{!isLoading && (siteTags || []).length < 1 ? <p>No tags found</p> : null}
			{
				isLoading ? 'Loading tags...' : (
					<ul>
						{(siteTags || []).map((tag) => (
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

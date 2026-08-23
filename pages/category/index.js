import useSWR from 'swr';
import { getCategories } from '@/lib/api';
import Link from 'next/link';

export default function Category() {
	const { data: siteCategories, isLoading } = useSWR('categories', getCategories);

	return (
		<div className='container max-w-screen-md mx-auto my-10 inline-block'>
			<h2 className='text-2xl my-5 font-medium'>Category</h2>
			{
				isLoading ? 'Loading categories...' : (
					<ul>
						{(siteCategories || []).map((category) => (
							<li key={category.id}>
								<Link className="capitalize text-slate-600 text-base hover:text-slate-950" href={`/category/${category.slug}`}>
									{category.name}
								</Link>
							</li>
						))}
					</ul>
				)
			}
		</div>
	);
}

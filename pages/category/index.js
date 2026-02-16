
import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api';
import Link from 'next/link';


export default function Category() {

	const [loading, setLoading] = useState(false); // Loading state for button
	const [siteCategories, setSiteCategories] = useState([]); // Store fetched categories


	useEffect(() => {
		fetchCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchCategories = async () => {
		if (loading) return;
		setLoading(true);
		try {
		  const response = await getCategories();
		  if (response.length < 1){
			setSiteCategories([]);
		  }else{
			setSiteCategories(response);
		  }
		} catch (error) {
		  console.error('Error fetching categories:', error);
		} finally {
		  setLoading(false);
		}
	}

	// console.log('siteCategories', siteCategories);

	return (
		<div className='container max-w-screen-md mx-auto my-10 inline-block'>
			<h2 className='text-2xl my-5 font-medium'>Category</h2>
			{
				loading ? 'Loading categories...' : (
					<ul>
						{siteCategories.map((category) => (
							
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
import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth';

export default function LoginMenu() {
	const userData = useAuth();
	return (
		<li>
			<Link className='text-slate-600 text-base hover:text-slate-950' href="/login">
				{userData ? 'Dashboard' : 'Login'}
			</Link>
		</li>
	)
}

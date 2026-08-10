'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFocusMode } from '../context/FocusModeContext';
import { DEFAULT_USER } from '../config/user';
import { mainNavItems } from '../lib/nav';

const NavBar = () => {
	const { focusPageId } = useFocusMode();
	const pathname = usePathname();

	if (focusPageId) {
		return null;
	}

	return (
		<div className='hidden md:block relative z-50 text-base-content'>
			<div className='navbar bg-base-200 border-b-2 border-base-100'>
				<div className='navbar-start gap-2'>
					<Link href='/' id='content' className='btn btn-ghost text-xl'>
						foli
					</Link>
					<ul className='menu menu-horizontal px-1'>
						{mainNavItems.map(({ href, label, id, match }) => {
							const isActive = match(pathname);
							return (
								<li key={href}>
									<Link
										href={href}
										id={id}
										className={
											isActive
												? 'bg-secondary text-secondary-content'
												: undefined
										}>
										{label}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>

				<div className='navbar-end'>
					<div className='dropdown dropdown-end'>
						<div
							tabIndex={0}
							role='button'
							className='btn btn-ghost btn-circle avatar avatar-placeholder'>
							<div className='bg-base-100 text-base-content w-10 rounded-full'>
								<span className='text-sm'>AD</span>
							</div>
						</div>
						<ul
							tabIndex={0}
							className='menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow'>
							<li className='menu-title px-4 py-2'>
								<span>{DEFAULT_USER.name}</span>
								<span className='text-xs opacity-60'>{DEFAULT_USER.email}</span>
							</li>
							<li>
								<Link
									href='/settings'
									id='content'
									className={
										pathname.startsWith('/settings')
											? 'bg-secondary text-secondary-content'
											: undefined
									}>
									Settings
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NavBar;

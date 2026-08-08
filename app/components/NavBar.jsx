'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { DatabaseContext } from '../context/DatabaseContext';
import { useFocusMode } from '../context/FocusModeContext';
import { DEFAULT_USER } from '../config/user';

const NavBar = () => {
	const { adminProfile } = useContext(DatabaseContext);
	const { focusPageId } = useFocusMode();
	const pathname = usePathname();

	const isActive = (href) => (pathname === href ? 'btn-active' : '');

	if (focusPageId) {
		return null;
	}

	return (
		<div className='text-base-content'>
			<div
				className='navbar bg-base-200 justify-between 
			border-b-2 border-base-100 
			'>
				{/* Left content */}
				<div className='flex gap-2 items-center'>
					<Link href='/' id='content' className='btn btn-ghost text-lg'>
						foli
					</Link>
					<div className='hidden md:flex'>
						<Link
							href='/'
							className={`btn btn-ghost btn-sm ${isActive('/')}`}
							id='jobs'>
							Jobs
						</Link>
						<Link
							href='/practice'
							className={`btn btn-ghost btn-sm ${isActive('/practice')}`}
							id='practice'>
							Practice
						</Link>
						<Link
							href='/my-questions'
							className={`btn btn-ghost btn-sm ${isActive('/my-questions')}`}
							id='my-questions'>
							My questions
						</Link>
					</div>
					{/* Test page */}
					{adminProfile ? (
						<div className='navbar-center hidden lg:flex'>
							<ul className='menu menu-horizontal px-1'>
								<li>
									<Link href='/test' id='content'>
										Testing
									</Link>
								</li>
							</ul>
						</div>
					) : null}
				</div>

				{/* Right content */}
				<div className='flex-none'>
					{/* Profile btn */}
					<div className='dropdown dropdown-end'>
						<div
							tabIndex={0}
							role='button'
							className='btn btn-ghost btn-circle avatar placeholder'>
							<div className='bg-neutral text-neutral-content w-10 rounded-full'>
								<span className='text-sm'>AD</span>
							</div>
						</div>
						<ul
							tabIndex={0}
							className='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow'>
							<li className='menu-title px-4 py-2'>
								<span>{DEFAULT_USER.name}</span>
								<span className='text-xs opacity-60'>{DEFAULT_USER.email}</span>
							</li>
							<li>
								<Link href='/settings' id='content'>
									Settings
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
			{/* <div className='divider m-0 p-0'></div> */}
		</div>
	);
};

export default NavBar;

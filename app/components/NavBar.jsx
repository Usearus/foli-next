'use client';

import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';

const NavBar = () => {
	const { user } = useUser();
	const { adminProfile } = useContext(DatabaseContext);

	return (
		<div className='text-base-content'>
			<div
				className='navbar bg-base-200 justify-between 
			border-b-2 border-base-100 
			'>
				{/* Left content */}
				<div>
					{/* Logo */}
					<Link href='/' id='content' className='btn btn-ghost text-lg'>
						foli
					</Link>
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
							className='btn btn-ghost btn-circle avatar'>
							{user ? (
								<div className='w-10 rounded-full'>
									<Image
										src={user.picture}
										alt={user.name}
										width='40'
										height='40'
									/>
								</div>
							) : null}
						</div>
						<ul
							tabIndex={0}
							className='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow'>
							<li>
								<Link href='/settings' id='content'>
									Settings
								</Link>
							</li>
							<li>
								<a href='/api/auth/logout'>Logout</a>
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

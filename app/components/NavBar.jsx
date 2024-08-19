'use client';

import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';

const NavBar = () => {
	const { user } = useUser();
	const { adminProfile } = useContext(DatabaseContext);

	return (
		<>
			<header className='navbar bg-base-100 justify-between'>
				<div>
					<Link href='/' id='content' className='btn btn-ghost text-lg'>
						foli
					</Link>
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
				{/* Profile btn */}
				{user ? (
					<div className='dropdown dropdown-bottom dropdown-end'>
						<div
							tabIndex={0}
							role='button'
							className='btn btn-ghost btn-circle avatar'>
							<div className='w-10 rounded-full'>
								<Image
									src={user.picture}
									alt={user.name}
									width='40'
									height='40'
								/>
							</div>
							{/* List of options */}
							<ul
								tabIndex={0}
								className='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow'>
								<li>
									<a>Profile</a>
								</li>
								<li>
									<a>Settings</a>
								</li>
								<li>
									<a href='/api/auth/logout'>Logout</a>
								</li>
							</ul>
						</div>
					</div>
				) : (
					<a href='/api/auth/login'>Login</a>
				)}
			</header>
		</>
	);
};

export default NavBar;

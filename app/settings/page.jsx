'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { useUser } from '@auth0/nextjs-auth0/client';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import ThemeToggle from '../components/ThemeToggle';
import Loader from '../components/Loader';

const Settings = () => {
	const { user } = useUser();
	const { userProfile } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isLoading, setIsLoading] = useState(true);

	// Refs for each section
	const accountRef = useRef(null);
	const profileRef = useRef(null);
	const jobSearchRef = useRef(null);

	// Simulate loading
	useEffect(() => {
		// Assuming you have data loading or API calls here
		// Set the loading state to false once everything is loaded
		if (user && userProfile) {
			setIsLoading(false);
		}
	}, [user, userProfile]);

	// Function to scroll to a specific section
	const scrollToSection = (ref) => {
		if (ref && ref.current) {
			ref.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-full'>
				<Loader />
			</div>
		);
	}

	return (
		<div className='h-full text-base-content px-0 py-4 bg-base-200 flex'>
			{/* Sidebar */}
			<div className='w-[250px] hidden md:block'>
				<ul className='menu'>
					<li>
						<span className='font-bold'>General</span>
						<ul>
							<li>
								<a onClick={() => scrollToSection(accountRef)}>Account</a>
							</li>
							<li>
								<a onClick={() => scrollToSection(profileRef)}>Profile</a>
							</li>
							<li>
								<a onClick={() => scrollToSection(jobSearchRef)}>Job search</a>
							</li>
						</ul>
					</li>
					<li className='disabled'>
						<span className='justify-between'>
							<a>Resume</a> <LockClosedIcon />
						</span>
						<ul>
							<li className='disabled'>
								<span className='justify-between'>
									<a>Contact</a> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<a>Summary</a> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<a>Work history</a> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<a>Education</a> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<a>Skills</a> <LockClosedIcon />
								</span>
							</li>
						</ul>
					</li>
				</ul>
			</div>
			{/* Content */}
			<div className='flex justify-center w-full overflow-y-auto'>
				<div className='max-w-[700px]  w-full p-4 flex flex-col gap-4 '>
					{/* Account card */}
					<div ref={accountRef} className='bg-base-100 p-8 flex flex-col gap-6'>
						<div>
							<h2 className='text-xl font-bold'>Account settings</h2>
						</div>
						{user ? (
							<div className='flex flex-col gap-4'>
								<label className='form-control w-full max-w-xs'>
									<div className='label font-bold'>
										<span className='label-text'>Name</span>
									</div>
									<div className='px-4 py-2'>{user.name}</div>
								</label>
								<div className='divider m-0'></div>
								<label className='form-control w-full max-w-xs'>
									<div className='label font-bold'>
										<span className='label-text'>Email</span>
									</div>
									<div className='px-4 py-2'>{user.email}</div>
								</label>
							</div>
						) : null}
					</div>
					{/* Profile card */}
					<div ref={profileRef} className='bg-base-100 p-8 flex flex-col gap-6'>
						<div>
							<h2 className='text-xl font-bold'>Profile settings</h2>
						</div>
						{user ? (
							<div className='flex flex-col gap-4'>
								<label className='w-full flex justify-between'>
									<div className='label font-bold'>
										<span className='label-text'>Interface theme</span>
									</div>
									<ThemeToggle />
								</label>
							</div>
						) : null}
					</div>
					{/* Job search card */}
					<div
						ref={jobSearchRef}
						className='bg-base-100 p-8 flex flex-col gap-6'>
						<div>
							<h2 className='text-xl font-bold'>Job search settings</h2>
						</div>
						{userProfile ? (
							<div className='flex flex-col gap-4'>
								<label className='form-control w-full max-w-xs'>
									<div className='label font-bold'>
										<span className='label-text'>Target position</span>
									</div>
									<div className='px-4 py-2'>{userProfile.position}</div>
								</label>
								<div className='divider m-0'></div>
								<label className='form-control w-full max-w-xs'>
									<div className='label font-bold'>
										<span className='label-text'>Current salary</span>
									</div>
									<div className='px-4 py-2'>N/A</div>
								</label>
								<div className='divider m-0'></div>
								<label className='form-control w-full max-w-xs'>
									<div className='label font-bold'>
										<span className='label-text'>Target salary</span>
									</div>
									<div className='px-4 py-2'>
										{userProfile.salary_min !== undefined &&
										userProfile.salary_max !== undefined
											? `$${userProfile.salary_min.toLocaleString()} - $${userProfile.salary_max.toLocaleString()}`
											: 'Salary range not specified'}
									</div>
								</label>
								<div className='divider m-0'></div>
								<label className='form-control w-full max-w-xs'>
									<div className='label font-bold'>
										<span className='label-text'>Target salary increase</span>
									</div>
									<div className='px-4 py-2'>N/A</div>
								</label>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;

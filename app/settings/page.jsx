'use client';

import { useRef, useContext } from 'react';
import {
	LockClosedIcon,
	ArrowUpIcon,
	ArrowDownIcon,
} from '@radix-ui/react-icons';
import { DatabaseContext } from '../context/DatabaseContext';
import { DEFAULT_USER } from '../config/user';
import ThemeToggle from '../components/ThemeToggle';
import ContentLoader from '../components/ContentLoader';
import EditPreferencesBtn from '../components/EditPreferencesBtn';

const Settings = () => {
	const { userProfile, isProfileLoading } = useContext(DatabaseContext);

	const profileRef = useRef(null);
	const jobPreferencesRef = useRef(null);
	const contentRef = useRef(null);

	const scrollToSection = (ref) => {
		if (!ref?.current || !contentRef?.current) return;

		const container = contentRef.current;
		const target = ref.current;
		const scrollTop =
			container.scrollTop +
			target.getBoundingClientRect().top -
			container.getBoundingClientRect().top;

		container.scrollTo({ top: scrollTop, behavior: 'smooth' });
	};

	if (isProfileLoading) {
		return (
			<div className='h-full min-h-0 text-base-content px-0 py-4 flex'>
				<div className='w-[350px] hidden lg:flex shrink-0' />
				<div className='flex flex-1 min-h-0 justify-center w-full overflow-y-auto'>
					<ContentLoader className='max-w-[700px]' />
				</div>
			</div>
		);
	}

	const targetSalaryIncrease =
		userProfile?.salary_target !== undefined &&
		userProfile?.salary_current !== undefined
			? Math.round(
					((userProfile.salary_target - userProfile.salary_current) /
						userProfile.salary_current) *
						100
			  )
			: undefined;

	const salaryIncreaseClassName =
		targetSalaryIncrease > 0 ? 'text-success' : 'text-error';

	const formattedSalaryIncrease =
		targetSalaryIncrease !== undefined ? (
			targetSalaryIncrease > 0 ? (
				<div className='flex items-center'>
					<ArrowUpIcon className='inline-block mr-1' />
					{targetSalaryIncrease}%
				</div>
			) : (
				<div className='flex items-center'>
					<ArrowDownIcon className='inline-block mr-1' />
					{Math.abs(targetSalaryIncrease)}%
				</div>
			)
		) : (
			''
		);

	const tooltipText =
		targetSalaryIncrease !== undefined
			? targetSalaryIncrease > 0
				? `${targetSalaryIncrease}% higher than current salary`
				: `${Math.abs(targetSalaryIncrease)}% lower than current salary`
			: '';

	const targetSalaryDisplay = (() => {
		if (userProfile?.salary_target && userProfile?.salary_current) {
			return (
				<>
					${userProfile.salary_target.toLocaleString()}{' '}
					<div className='tooltip' data-tip={tooltipText}>
						<span className={`badge badge-outline ${salaryIncreaseClassName}`}>
							{formattedSalaryIncrease}
						</span>
					</div>
				</>
			);
		}

		if (userProfile?.salary_target && !userProfile?.salary_current) {
			return `$${userProfile.salary_target.toLocaleString()}`;
		}

		return '-';
	})();

	const firstName = DEFAULT_USER.name.split(' ')[0];

	return (
		<div className='h-full min-h-0 text-base-content px-0 py-4 flex'>
			{/* Sidebar */}
			<div className='w-[350px] hidden lg:flex shrink-0'>
				<ul className='menu'>
					<li>
						<span className='font-bold'>General</span>
						<ul>
							<li>
								<button type='button' onClick={() => scrollToSection(profileRef)}>
									Profile
								</button>
							</li>
							<li>
								<button
									type='button'
									onClick={() => scrollToSection(jobPreferencesRef)}>
									Job preferences
								</button>
							</li>
						</ul>
					</li>
					<li className='disabled'>
						<span className='justify-between'>
							<button type='button'>Resume</button> <LockClosedIcon />
						</span>
						<ul>
							<li className='disabled'>
								<span className='justify-between'>
									<button type='button'>Contact</button> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<button type='button'>Summary</button> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<button type='button'>Work history</button> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<button type='button'>Education</button> <LockClosedIcon />
								</span>
							</li>
							<li className='disabled'>
								<span className='justify-between'>
									<button type='button'>Skills</button> <LockClosedIcon />
								</span>
							</li>
						</ul>
					</li>
				</ul>
			</div>

			{/* Content cards */}
			<div
				ref={contentRef}
				className='flex flex-1 min-h-0 justify-center w-full overflow-y-auto'>
				<div className='max-w-[700px] w-full p-4 flex flex-col gap-4'>
					<div ref={profileRef} className='bg-base-100 rounded-box p-8 flex flex-col gap-6'>
						<div>
							<h2 className='text-xl font-bold'>Profile</h2>
						</div>
						{userProfile ? (
							<div className='flex flex-col gap-4'>
								<label className='form-control w-full'>
									<div className='label font-bold'>
										<span className='label-text'>Picture</span>
									</div>
									<div className='avatar placeholder'>
										<div className='bg-neutral text-neutral-content w-16 rounded-full'>
											<span className='text-xl'>
												{userProfile.email?.[0]?.toUpperCase() ?? 'A'}
											</span>
										</div>
									</div>
								</label>
								<div className='divider m-0'></div>
								<div className='flex gap-4'>
									<label className='form-control w-full'>
										<div className='label font-bold'>
											<span className='label-text'>Name</span>
										</div>
										<div className='px-1'>{firstName}</div>
									</label>
									<label className='form-control w-full'>
										<div className='label font-bold'>
											<span className='label-text'>Email</span>
										</div>
										<div className='px-1'>{userProfile.email}</div>
									</label>
								</div>
								<div className='divider m-0'></div>
								<label className='w-full flex justify-between'>
									<div className='label font-bold'>
										<span className='label-text'>Interface theme</span>
									</div>
									<ThemeToggle />
								</label>
							</div>
						) : null}
					</div>

					{userProfile ? (
						<div
							ref={jobPreferencesRef}
							className='bg-base-100 rounded-box p-8 flex flex-col gap-6'>
							<div className='flex justify-between items-center'>
								<h2 className='text-xl font-bold'>Job preferences</h2>
								<EditPreferencesBtn />
							</div>
							<div className='flex flex-col gap-4'>
								<label className='form-control w-full'>
									<div className='label font-bold'>
										<span className='label-text'>Target position</span>
									</div>
									<div className='px-1'>
										{userProfile.position ? userProfile.position : '-'}
									</div>
								</label>
								<div className='divider m-0'></div>
								<div className='flex gap-4'>
									<label className='form-control w-full'>
										<div className='label font-bold'>
											<span className='label-text'>Current Salary</span>
										</div>
										<div className='px-1'>
											{userProfile.salary_current !== undefined &&
											userProfile.salary_current !== null
												? `$${userProfile.salary_current.toLocaleString()}`
												: '-'}
										</div>
									</label>
									<label className='form-control w-full'>
										<div className='label font-bold'>
											<span className='label-text'>Target salary</span>
										</div>
										<div className='px-1'>{targetSalaryDisplay}</div>
									</label>
								</div>
								<div className='divider m-0'></div>
								<label className='form-control w-full'>
									<div className='label font-bold'>
										<span className='label-text'>Locations</span>
									</div>
									<div className='flex gap-2 flex-wrap'>
										{Array.isArray(userProfile.location_preference) &&
											userProfile.location_preference.map((location) => (
												<div
													key={location}
													className='badge badge-neutral mt-2'>
													{location}
												</div>
											))}
										{userProfile.location_remote ? (
											<div className='badge badge-neutral mt-2'>
												Remote / Hybrid
											</div>
										) : null}
									</div>
								</label>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default Settings;

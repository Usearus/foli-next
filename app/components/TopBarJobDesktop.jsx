'use client';
import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { ChevronDownIcon } from '@radix-ui/react-icons';

const TopBarJobDesktop = () => {
	const { currentJob } = useContext(DatabaseContext);

	return (
		<div className='p-4 row-span-1 col-span-1 lg:col-span-2 bg-base-200 flex items-center justify-between '>
			<div className='flex gap-6 items-center'>
				<div className='max-w-[200px]'>
					<p className='font-bold whitespace-nowrap overflow-hidden text-ellipsis'>
						{currentJob.company}
					</p>

					{currentJob.link ? (
						<a href={currentJob.link} target='_blank' rel='noreferrer'>
							<p className='link link-primary text-sm whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer'>
								{currentJob.position}
							</p>
						</a>
					) : (
						<p className='text-sm whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer'>
							{currentJob.position}
						</p>
					)}
				</div>
				<div className='dropdown dropdown-end'>
					<div
						tabIndex={0}
						role='button'
						className='btn btn-xs btn-outline flex justify-between min-w-32'>
						{currentJob.status} <ChevronDownIcon />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow'>
						<li>
							<a>Interested</a>
						</li>
						<li>
							<a>Applied</a>
						</li>
						<li>
							<a>Interviewing</a>
						</li>
						<li>
							<a>Negotiating</a>
						</li>
						<li>
							<a>Accepted</a>
						</li>
						<li>
							<a>Declined</a>
						</li>
						<li>
							<a>Rejected</a>
						</li>
						<li>
							<a>Archived</a>
						</li>
					</ul>
				</div>
			</div>
			<div>
				<h2 className='text-lg font-bold'>Add page</h2>
			</div>
		</div>
	);
};

export default TopBarJobDesktop;

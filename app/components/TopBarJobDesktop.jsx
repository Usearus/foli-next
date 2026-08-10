'use client';
import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import AddPageDropdown from './AddPageDropdown';
import EditJobBtn from './EditJobBtn';
import DeleteJobBtn from './DeleteJobBtn';
import JobStatusSteps from './JobStatusSteps';
import JobStatusDropdown from './JobStatusDropdown';

const TopBarJobDesktop = () => {
	const { currentJob } = useContext(DatabaseContext);

	return (
		<div className='p-4 row-span-1 col-span-1 lg:col-span-2 bg-base-200 flex items-center justify-between gap-4 z-10'>
			<div className='flex gap-6 items-center min-w-0 flex-1'>
				<div className='w-55.5 shrink-0'>
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
				<div className='min-w-0 flex-1 hidden lg:block'>
					<JobStatusSteps job={currentJob} />
				</div>
				<div className='lg:hidden shrink-0'>
					<JobStatusDropdown job={currentJob} />
				</div>
			</div>
			<div className='flex items-center shrink-0'>
				<div className='hidden md:block'>
					<AddPageDropdown />
				</div>
				<div className='dropdown dropdown-end'>
					<div tabIndex={0} role='button' className='btn btn-ghost'>
						<DotsVerticalIcon />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow'>
						<li>
							<EditJobBtn job={currentJob} />
						</li>
						<li>
							<DeleteJobBtn
								job={currentJob}
								label='Delete job'
								className='text-error'
								redirectOnDelete
							/>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default TopBarJobDesktop;

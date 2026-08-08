'use client';

import { useContext } from 'react';
import { DatabaseContext } from './context/DatabaseContext';
import JobsTable from './components/JobsTable';
import AddJobBtn from './components/AddJobBtn';

const Page = () => {
	const { userJobs, userJobsClosed } = useContext(DatabaseContext);

	return (
		<div className='p-0 pt-6 lg:p-12 flex flex-col h-full'>
			<div className='flex items-center justify-between mb-4 px-4 lg:px-0'>
				<div>
					<p className='text-base md:text-xl font-bold'>Jobs</p>
					<p className='text-sm hidden md:block opacity-70'>
						View jobs within your job search.
					</p>
				</div>
				<AddJobBtn />
			</div>

			<div role='tablist' className='tabs tabs-bordered px-4 lg:px-0'>
				<input
					type='radio'
					name='my_tabs_1'
					role='tab'
					className='tab'
					aria-label='Active'
					defaultChecked
				/>
				<div role='tabpanel' className='tab-content pt-4'>
					<JobsTable jobs={userJobs} />
				</div>

				<input
					type='radio'
					name='my_tabs_1'
					role='tab'
					className='tab'
					aria-label='Closed'
				/>
				<div role='tabpanel' className='tab-content pt-4'>
					<JobsTable jobs={userJobsClosed} />
				</div>
			</div>
		</div>
	);
};

export default Page;

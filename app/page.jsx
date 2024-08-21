'use client';

import { useContext } from 'react';
import { DatabaseContext } from './context/DatabaseContext';
import JobsTable from './components/JobsTable';

const Page = () => {
	const { userJobs, userJobsArchived } = useContext(DatabaseContext);

	return (
		<>
			{/* Tabs component */}
			<div className='p-0 pt-6 lg:p-12'>
				<div role='tablist' className='tabs tabs-bordered'>
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
						aria-label='Archived'
					/>
					<div role='tabpanel' className='tab-content pt-4'>
						<JobsTable jobs={userJobsArchived} />
					</div>
				</div>
			</div>
		</>
	);
};

export default Page;

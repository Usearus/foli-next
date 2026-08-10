'use client';

import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import PaginatedJobsTable from '../components/PaginatedJobsTable';
import TopBarJobs from '../components/TopBarJobs';
import ContentLoader from '../components/ContentLoader';

const Page = () => {
	const { userJobs, userJobsClosed, isJobLoading, isProfileLoading } =
		useContext(DatabaseContext);

	if (isProfileLoading || isJobLoading) {
		return (
			<div className='flex flex-col h-full text-base-content'>
				<ContentLoader />
			</div>
		);
	}

	return (
		<div className='relative flex flex-col h-full text-base-content'>
			<TopBarJobs />
			<div className='grow overflow-y-auto flex flex-col'>
				<div className='max-w-7xl mx-auto w-full py-4 flex flex-col'>
					<div role='tablist' className='tabs tabs-box w-full p-0'>
						<input
							type='radio'
							name='jobs_tabs'
							role='tab'
							className='tab'
							aria-label='Active'
							defaultChecked
						/>
						<div
							role='tabpanel'
							className='tab-content bg-base-100 rounded-lg overflow-visible'>
							<PaginatedJobsTable jobs={userJobs} />
						</div>

						<input
							type='radio'
							name='jobs_tabs'
							role='tab'
							className='tab'
							aria-label='Closed'
						/>
						<div
							role='tabpanel'
							className='tab-content bg-base-100 rounded-lg overflow-visible'>
							<PaginatedJobsTable jobs={userJobsClosed} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;

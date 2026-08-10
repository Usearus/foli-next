'use client';

import { useContext, useMemo, useState } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import PaginatedJobsTable from '../components/PaginatedJobsTable';
import JobDashboardStats from '../components/JobDashboardStats';
import TopBarJobs from '../components/TopBarJobs';
import ContentLoader from '../components/ContentLoader';
import {
	filterJobsByDashboardStatus,
	JOB_DASHBOARD_FILTER,
} from '../lib/jobStats';

const Page = () => {
	const { userJobs, userJobsClosed, isJobLoading, isProfileLoading } =
		useContext(DatabaseContext);
	const [statusFilter, setStatusFilter] = useState(JOB_DASHBOARD_FILTER.OPEN);

	const filteredJobs = useMemo(
		() => filterJobsByDashboardStatus(userJobs, userJobsClosed, statusFilter),
		[userJobs, userJobsClosed, statusFilter],
	);

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
				<div className='max-w-7xl mx-auto w-full py-4 flex flex-col gap-4'>
					<div className='bg-base-100 rounded-lg overflow-visible'>
						<JobDashboardStats
							openJobs={userJobs}
							closedJobs={userJobsClosed}
							activeFilter={statusFilter}
							onFilterChange={setStatusFilter}
						/>
					</div>
					<div className='bg-base-100 rounded-lg overflow-visible'>
						<PaginatedJobsTable
							key={statusFilter}
							jobs={filteredJobs}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;

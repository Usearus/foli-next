'use client';

import { useMemo } from 'react';
import { computeJobStats, getDashboardFilterCards } from '../lib/jobStats';

const RateCard = ({ title, rate, count, countLabel, progressClass }) => (
	<div className='bg-base-100 rounded-lg border border-base-200 shadow-sm p-5'>
		<p className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>
			{title}
		</p>
		<p className='text-4xl font-bold mt-1'>{rate}%</p>
		<progress
			className={`progress ${progressClass} w-full mt-4 h-2`}
			value={rate}
			max={100}
		/>
		<div className='flex justify-between text-xs text-base-content/60 mt-2'>
			<span>
				{count} {countLabel}
			</span>
			<span>of total apps</span>
		</div>
	</div>
);

const JobDashboardStats = ({
	openJobs = [],
	closedJobs = [],
	activeFilter,
	onFilterChange,
}) => {
	const stats = useMemo(
		() => computeJobStats(openJobs, closedJobs),
		[openJobs, closedJobs],
	);

	const statusCards = useMemo(() => getDashboardFilterCards(stats), [stats]);

	return (
		<div className='flex flex-col gap-4 p-4'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<RateCard
					title='Response Rate'
					rate={stats.responseRate}
					count={stats.responses}
					countLabel='responses'
					progressClass='progress-success'
				/>
				<RateCard
					title='Interview Rate'
					rate={stats.interviewRate}
					count={stats.interviews}
					countLabel='interviews'
					progressClass='progress-warning'
				/>
			</div>

			<div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3'>
				{statusCards.map(({ id, label, value }) => {
					const isActive = activeFilter === id;

					return (
						<button
							key={id}
							type='button'
							className={`bg-base-100 rounded-lg border shadow-sm px-4 py-5 text-center transition-colors cursor-pointer hover:border-secondary/50 ${
								isActive
									? 'border-secondary ring-2 ring-secondary/25'
									: 'border-base-200'
							}`}
							onClick={() => onFilterChange(id)}
							aria-pressed={isActive}>
							<p className='text-3xl font-bold text-secondary'>{value}</p>
							<p className='text-xs font-semibold tracking-wide text-base-content/60 mt-1'>
								{label}
							</p>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default JobDashboardStats;

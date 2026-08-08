'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseContext } from '../context/DatabaseContext';
import {
	DotsVerticalIcon,
	ChevronDownIcon,
	ArrowUpIcon,
	ArrowDownIcon,
} from '@radix-ui/react-icons';

const JobsTableRow = (job) => {
	const { fetchCurrentJob, fetchCurrentPages, userProfile } =
		useContext(DatabaseContext);
	const router = useRouter();

	const handleTableRowClick = async () => {
		await fetchCurrentJob(job);
		await fetchCurrentPages(job);
		router.push(`/job/id:${job.id}`);
	};

	const targetSalaryIncrease =
		userProfile?.salary_target !== undefined &&
		userProfile?.salary_current !== undefined &&
		job.salary_max
			? Math.round(
					((job.salary_max - userProfile.salary_current) /
						userProfile.salary_target) *
						100
			  )
			: undefined;

	const salaryIncreaseClassName =
		targetSalaryIncrease > 0 ? 'badge-success' : 'badge-error';

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

	const salaryBadge =
		userProfile?.salary_target && targetSalaryIncrease !== undefined ? (
			<div className='tooltip' data-tip={tooltipText}>
				<span className={`badge badge-outline ${salaryIncreaseClassName}`}>
					{formattedSalaryIncrease}
				</span>
			</div>
		) : null;

	const salaryDisplay = (() => {
		if (job.salary_min && job.salary_max) {
			return (
				<div className='flex flex-wrap items-center gap-2'>
					${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}{' '}
					{salaryBadge}
				</div>
			);
		}

		if (job.salary_min && (job.salary_max === 0 || job.salary_max === null)) {
			return (
				<div className='flex flex-wrap items-center gap-2'>
					${job.salary_min.toLocaleString()}
				</div>
			);
		}

		if ((job.salary_min === 0 || job.salary_min === null) && job.salary_max) {
			return (
				<div className='flex flex-wrap items-center gap-2'>
					${job.salary_max.toLocaleString()} {salaryBadge}
				</div>
			);
		}

		return '-';
	})();

	return (
		<tr key={job.id} className='hover:bg-base-100'>
			<td
				onClick={handleTableRowClick}
				className='min-w-[100px] max-w-[200px] cursor-pointer'>
				<div className='font-bold'>{job.company}</div>
				<div className='font-light whitespace-nowrap overflow-hidden text-ellipsis'>
					{job.position}
				</div>
			</td>
			<td
				onClick={handleTableRowClick}
				className='hidden lg:table-cell font-light cursor-pointer'>
				{salaryDisplay}
			</td>
			<td
				onClick={handleTableRowClick}
				className='hidden lg:table-cell cursor-pointer'>
				{job.location ? (
					<div className='badge badge-neutral overflow-hidden mr-2 my-1'>
						{job.location}
					</div>
				) : null}
				{job.remote ? (
					<div className='badge badge-neutral'>Remote / Hybrid</div>
				) : null}
			</td>
			<td
				onClick={handleTableRowClick}
				className='hidden lg:table-cell font-light cursor-pointer'>
				{new Date(job.edited).toLocaleDateString()}
			</td>
			<td>
				<div className='dropdown dropdown-end'>
					<div
						tabIndex={0}
						role='button'
						className='btn btn-xs btn-outline flex justify-between min-w-32'>
						{job.status} <ChevronDownIcon />
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
							<a>Closed</a>
						</li>
					</ul>
				</div>
			</td>
			<td className='w-8'>
				<div className='dropdown dropdown-end'>
					<div tabIndex={0} role='button' className='btn btn-xs btn-ghost'>
						<DotsVerticalIcon />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow'>
						<li>
							<a>Edit</a>
						</li>
						<li>
							<a>Delete</a>
						</li>
					</ul>
				</div>
			</td>
		</tr>
	);
};

export default JobsTableRow;

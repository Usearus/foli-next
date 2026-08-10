'use client';

import { useEffect, useMemo, useState } from 'react';
import JobsTable from './JobsTable';
import { getNextSortState, sortJobs } from '../lib/sortJobs';

const JOBS_PER_PAGE = 10;

const paginationBtnClass =
	'join-item btn !rounded-lg bg-base-100 border-base-100 hover:bg-base-content/5 hover:border-base-200';
const activePaginationBtnClass = 'join-item btn !rounded-lg';

const PaginatedJobsTable = ({ jobs = [] }) => {
	const [page, setPage] = useState(1);
	const [sortColumn, setSortColumn] = useState('job');
	const [sortDirection, setSortDirection] = useState('asc');

	const sortedJobs = useMemo(
		() => sortJobs(jobs, sortColumn, sortDirection),
		[jobs, sortColumn, sortDirection],
	);

	const totalJobs = sortedJobs.length;
	const totalPages = Math.max(1, Math.ceil(totalJobs / JOBS_PER_PAGE));

	const paginatedJobs = useMemo(() => {
		const start = (page - 1) * JOBS_PER_PAGE;
		return sortedJobs.slice(start, start + JOBS_PER_PAGE);
	}, [sortedJobs, page]);

	const handleSort = (column) => {
		const nextSort = getNextSortState(sortColumn, sortDirection, column);
		setSortColumn(nextSort.column);
		setSortDirection(nextSort.direction);
		setPage(1);
	};

	useEffect(() => {
		setPage(1);
	}, [totalJobs]);

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	if (totalJobs === 0) {
		return (
			<p className='text-sm text-base-content/70 px-4 py-6 text-center'>
				No jobs in this list yet.
			</p>
		);
	}

	const rangeStart = (page - 1) * JOBS_PER_PAGE + 1;
	const rangeEnd = Math.min(page * JOBS_PER_PAGE, totalJobs);
	const showPagination = totalPages > 1;

	return (
		<div className='flex flex-col'>
			<JobsTable
				jobs={paginatedJobs}
				sortColumn={sortColumn}
				sortDirection={sortDirection}
				onSort={handleSort}
			/>

			<div className='flex flex-col gap-3 border-t border-base-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
				<p className='text-sm text-base-content/70'>
					Showing {rangeStart}–{rangeEnd} of {totalJobs} job
					{totalJobs === 1 ? '' : 's'}
				</p>

				{showPagination ? (
					<div className='flex items-center gap-2'>
						<div className='join'>
							<button
								type='button'
								className={paginationBtnClass}
								onClick={() => setPage((current) => Math.max(1, current - 1))}
								disabled={page === 1}
								aria-label='Previous page'>
								«
							</button>
							{Array.from({ length: totalPages }, (_, index) => index + 1).map(
								(pageNumber) => (
									<button
										key={pageNumber}
										type='button'
										className={
											pageNumber === page
												? activePaginationBtnClass
												: paginationBtnClass
										}
										onClick={() => setPage(pageNumber)}
										aria-label={`Page ${pageNumber}`}
										aria-current={pageNumber === page ? 'page' : undefined}>
										{pageNumber}
									</button>
								),
							)}
							<button
								type='button'
								className={paginationBtnClass}
								onClick={() =>
									setPage((current) => Math.min(totalPages, current + 1))
								}
								disabled={page === totalPages}
								aria-label='Next page'>
								»
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default PaginatedJobsTable;

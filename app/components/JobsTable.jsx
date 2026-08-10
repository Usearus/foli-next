'use client';

import {
	InfoCircledIcon,
	ArrowUpIcon,
	ArrowDownIcon,
} from '@radix-ui/react-icons';
import JobsTableRow from './JobsTableRow';

const TABLE_HEADER_LABEL_CLASS =
	'text-xs font-semibold uppercase tracking-wide text-base-content/60';

const SortableHeader = ({
	column,
	label,
	labelContent,
	labelClassName = TABLE_HEADER_LABEL_CLASS,
	sortColumn,
	sortDirection,
	onSort,
	className = '',
	children,
	renderSortIndicator,
}) => {
	const isActive = sortColumn === column && sortDirection;
	const sortIndicator = isActive
		? (renderSortIndicator?.(sortDirection) ?? (
				<>
					{sortDirection === 'asc' ? (
						<ArrowUpIcon className='shrink-0' />
					) : null}
					{sortDirection === 'desc' ? (
						<ArrowDownIcon className='shrink-0' />
					) : null}
				</>
			))
		: null;

	return (
		<th className={`group relative p-0 ${className}`}>
			<button
				type='button'
				className='absolute inset-0 z-0 cursor-pointer group-hover:bg-base-content/5'
				onClick={() => onSort(column)}
				aria-label={
					isActive
						? renderSortIndicator
							? `Sort by ${label}, currently ${sortDirection === 'asc' ? 'remote first' : 'city first'}`
							: `Sort by ${label}, currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
						: `Sort by ${label}`
				}
			/>
			<div className='relative z-10 flex items-center gap-1 px-4 py-3 pointer-events-none group-hover:text-primary transition-colors'>
				<span className={labelClassName}>{labelContent ?? label}</span>
				{sortIndicator}
				{children}
			</div>
		</th>
	);
};

const JobsTable = ({ jobs, sortColumn, sortDirection, onSort }) => {
	return (
		<table className='table table-md w-full rounded-none text-base-content'>
			<thead>
				<tr>
					<SortableHeader
						column='job'
						label='Application'
						sortColumn={sortColumn}
						sortDirection={sortDirection}
						onSort={onSort}
						className='min-w-25 max-w-50'
					/>
					<SortableHeader
						column='salary'
						label='Salary'
						sortColumn={sortColumn}
						sortDirection={sortDirection}
						onSort={onSort}
						className='hidden lg:table-cell'>
						<div
							className='tooltip pointer-events-auto font-normal'
							data-tip='Sorting is based on max salary'
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}>
							<InfoCircledIcon />
						</div>
					</SortableHeader>
					<SortableHeader
						column='location'
						label='Location'
						sortColumn={sortColumn}
						sortDirection={sortDirection}
						onSort={onSort}
						className='hidden lg:table-cell'
						renderSortIndicator={(direction) => (
							<span className='shrink-0 text-xs font-semibold uppercase tracking-wide text-base-content/60'>
								{direction === 'asc' ? '(Remote first)' : '(City first)'}
							</span>
						)}
					/>
					<SortableHeader
						column='status'
						label='Status'
						sortColumn={sortColumn}
						sortDirection={sortDirection}
						onSort={onSort}
					/>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{jobs.map((job) => (
					<JobsTableRow key={job.id} {...job} id={job.id} />
				))}
			</tbody>
		</table>
	);
};

export default JobsTable;

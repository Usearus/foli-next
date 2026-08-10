'use client';

import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
	MY_QUESTION_FILTER_ALL,
	MY_QUESTION_CATEGORIES,
} from '../lib/questions';

const EmployerQuestionFilter = ({ activeFilter, onFilterChange, counts }) => {
	const filters = [MY_QUESTION_FILTER_ALL, ...MY_QUESTION_CATEGORIES];
	const activeCount = counts[activeFilter] ?? 0;

	const handleFilterClick = (filter, event) => {
		event.preventDefault();
		onFilterChange(filter);
		event.currentTarget.closest('.dropdown')?.querySelector('[tabindex="0"]')?.blur();
	};

	return (
		<div className='dropdown dropdown-end shrink-0'>
			<div
				tabIndex={0}
				role='button'
				className={`btn gap-2 ${
					activeFilter !== MY_QUESTION_FILTER_ALL
						? 'btn-secondary'
						: 'btn-outline'
				}`}
				aria-label='Filter by category'>
				<span className='max-w-[10rem] truncate'>{activeFilter}</span>
				<span className='badge badge-neutral'>{activeCount}</span>
				<ChevronDownIcon />
			</div>
			<ul
				tabIndex={0}
				className='dropdown-content menu bg-base-100 rounded-box z-10 w-56 p-2 shadow'>
				{filters.map((filter) => {
					const count = counts[filter] ?? 0;
					const isActive = activeFilter === filter;

					return (
						<li key={filter}>
							<a
								className={
									isActive
										? 'bg-secondary text-secondary-content'
										: undefined
								}
								onClick={(event) => handleFilterClick(filter, event)}>
								<span className='truncate'>{filter}</span>
								<span className='badge badge-neutral'>{count}</span>
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default EmployerQuestionFilter;

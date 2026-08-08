'use client';

import {
	EMPLOYER_QUESTION_FILTER_ALL,
	EMPLOYER_QUESTION_TYPES,
} from '../lib/employerQuestions';

const EmployerQuestionFilter = ({ activeFilter, onFilterChange, counts }) => {
	const filters = [EMPLOYER_QUESTION_FILTER_ALL, ...EMPLOYER_QUESTION_TYPES];

	return (
		<div className='max-w-3xl mx-auto w-full px-4 pt-4'>
			<div className='flex flex-wrap gap-2'>
				{filters.map((filter) => {
					const count = counts[filter] ?? 0;
					const isActive = activeFilter === filter;
					return (
						<button
							key={filter}
							type='button'
							className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
							onClick={() => onFilterChange(filter)}>
							{filter}
							<span className='badge badge-sm ml-1 badge-neutral'>{count}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default EmployerQuestionFilter;

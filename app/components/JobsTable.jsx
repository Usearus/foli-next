'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import JobsTableRow from './JobsTableRow';

const JobsTable = ({ jobs }) => {
	return (
		<table className='table text-base-content'>
			<thead>
				<tr>
					<th className='min-w-[100px] max-w-[200px]'>Job</th>
					<th className='hidden lg:table-cell'>
						<div className='flex items-center gap-1'>
							Salary
							<div
								className='tooltip font-normal'
								data-tip='Compared to your current salary'>
								<InfoCircledIcon />
							</div>
						</div>
					</th>
						<th className='hidden lg:table-cell'>Location</th>
						<th className='hidden lg:table-cell'>Edited</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				{/* Body */}
				<tbody>
					{jobs.map((job) => (
						<JobsTableRow key={job.id} {...job} id={job.id} />
					))}
				</tbody>
			</table>
	);
};

export default JobsTable;

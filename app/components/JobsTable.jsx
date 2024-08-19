'use client';

import JobsTableRow from './JobsTableRow';

const JobsTable = ({ jobs }) => {
	return (
		<>
			<table className='table'>
				{/* Head */}
				<thead>
					<tr>
						<th className='min-w-[100px] max-w-[200px]'>Job</th>
						<th className='hidden lg:table-cell'>Salary</th>
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
		</>
	);
};

export default JobsTable;

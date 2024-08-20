'use client';
import { useContext } from 'react';
import { DatabaseContext } from '../../context/DatabaseContext';

const JobPage = (job) => {
	const { currentJob } = useContext(DatabaseContext);

	return (
		<>
			<div className='p-0 pt-6 lg:p-12 text-base-content'>
				<h1>Position: {currentJob.position}</h1>
				<h1>Company: {currentJob.company}</h1>
				{/* Fetch and display job details based on the id */}
			</div>
		</>
	);
};

export default JobPage;

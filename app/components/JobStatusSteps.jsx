'use client';

import { JOB_STATUS_STEPS } from '../lib/jobStatuses';
import useJobStatusUpdate from '../hooks/useJobStatusUpdate';

const JobStatusSteps = ({ job }) => {
	const updateStatus = useJobStatusUpdate(job);

	const handleStepClick = (status) => {
		updateStatus(status);
	};

	const handleStepKeyDown = (event, status) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			updateStatus(status);
		}
	};

	return (
		<nav
			className='job-chevron-steps overflow-x-auto'
			aria-label='Job status'>
			<ol className='flex min-w-max items-center list-none m-0 p-0'>
				{JOB_STATUS_STEPS.map((status, index) => {
					const currentIndex = JOB_STATUS_STEPS.indexOf(job?.status);
					const isCurrent = status === job?.status;
					const isPrevious =
						currentIndex >= 0 && index < currentIndex;

					return (
						<li
							key={status}
							className='relative'
							style={{
								zIndex: JOB_STATUS_STEPS.length - index,
							}}>
							<button
								type='button'
								className={`job-chevron-step ${
									isCurrent ? 'job-chevron-step--active' : ''
								} ${isPrevious ? 'job-chevron-step--previous' : ''}`}
								onClick={() => handleStepClick(status)}
								onKeyDown={(event) => handleStepKeyDown(event, status)}
								aria-current={isCurrent ? 'step' : undefined}
								aria-label={`Set status to ${status}`}>
								{status}
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

export default JobStatusSteps;

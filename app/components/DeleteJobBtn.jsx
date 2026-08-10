'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';

const DeleteJobBtn = ({
	job,
	label = 'Delete',
	redirectOnDelete = false,
	className = '',
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { fetchUserJobs, fetchUserJobsClosed, currentJob, setCurrentJob } =
		useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const router = useRouter();

	const handleDeleteJob = async () => {
		if (!job?.id) {
			setAlert('Unable to delete job', 'error');
			return;
		}

		const { error: pagesError } = await supabase
			.from('pages')
			.delete()
			.eq('jobid', job.id);

		if (pagesError) {
			console.error(pagesError);
			setAlert('Unable to delete job pages', 'error');
			return;
		}

		const { error } = await supabase.from('jobs').delete().eq('id', job.id);

		if (error) {
			console.error(error);
			setAlert('Unable to delete job', 'error');
			return;
		}

		if (currentJob?.id === job.id) {
			setCurrentJob([]);
			localStorage.removeItem('currentJob');
			localStorage.removeItem('currentPages');
		}

		await Promise.all([fetchUserJobs(), fetchUserJobsClosed()]);
		setAlert('Job deleted', 'success');
		setIsModalOpen(false);

		if (redirectOnDelete || currentJob?.id === job.id) {
			router.push('/');
		}
	};

	return (
		<>
			<button
				type='button'
				className={className}
				onClick={() => setIsModalOpen(true)}>
				{label}
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Delete job'>
				<div className='pb-4'>
					<p>
						Are you sure you want to delete{' '}
						<span className='font-bold'>{job.company}</span>? This will also
						delete all pages for this job. This cannot be undone.
					</p>
				</div>
				<div className='flex justify-end'>
					<button
						type='button'
						className='btn btn-outline btn-error'
						onClick={handleDeleteJob}>
						Confirm
					</button>
				</div>
			</Modal>
		</>
	);
};

export default DeleteJobBtn;

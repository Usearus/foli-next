'use client';

import { useContext, useCallback } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import { supabase } from '../api/supabase';

const useJobStatusUpdate = (job) => {
	const {
		fetchUserJobs,
		fetchUserJobsClosed,
		fetchCurrentJob,
		currentJob,
	} = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	const updateStatus = useCallback(
		async (newStatus) => {
			if (!job?.id || newStatus === job.status) {
				return;
			}

			const { error } = await supabase
				.from('jobs')
				.update({
					status: newStatus,
					edited: new Date().toLocaleDateString('en-US'),
				})
				.eq('id', job.id);

			if (error) {
				setAlert('Unable to update status', 'error');
				console.log(error);
				return;
			}

			await Promise.all([fetchUserJobs(), fetchUserJobsClosed()]);
			if (currentJob?.id === job.id) {
				await fetchCurrentJob(job);
			}

			setAlert('Status updated', 'success');
		},
		[
			job,
			currentJob?.id,
			fetchUserJobs,
			fetchUserJobsClosed,
			fetchCurrentJob,
			setAlert,
		],
	);

	return updateStatus;
};

export default useJobStatusUpdate;

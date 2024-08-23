import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import { supabase } from '../api/supabase';

const ModalDeleteConfirmation = ({ show, close, type, object }) => {
	const { setAlert } = useAlert();
	const { fetchUserJobs, fetchCurrentPages, currentJob, fetchUserSnippets } =
		useContext(DatabaseContext);

	const handleDelete = async (e) => {
		if (type === 'job') {
			const { error } = await supabase
				.from('jobs')
				.delete()
				.eq('id', object.id);
			if (error) {
				console.error(error);
				setAlert('Unable to delete job.', 'Danger');
				return;
			}
			setAlert('Job deleted', 'success');
			fetchUserJobs();
		}
		if (type === 'page') {
			const { error } = await supabase
				.from('pages')
				.delete()
				.eq('id', object.id);
			if (error) {
				console.error(error);
				setAlert('Unable to delete page', 'Danger');
				return;
			}
			setAlert('Page deleted', 'success');
			fetchCurrentPages(currentJob);
		}
		if (type === 'snippet') {
			const { error } = await supabase
				.from('snippets')
				.delete()
				.eq('id', object.id);
			if (error) {
				console.error(error);
				setAlert('Unable to delete snippet.', 'Danger');
				return;
			}
			setAlert('Snippet deleted', 'success');
			fetchUserSnippets();
		}
	};
	return (
		<>
			<dialog className='modal'>
				<div className='modal-box'>
					<form method='dialog'>
						<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
							✕
						</button>
					</form>
					<h3 className='font-bold text-lg'>Confirm delete</h3>
					<p className='py-4'>Are you sure you want to delete this page?</p>
					<button
						type='button'
						className='btn btn-sm btn-primary-outline w-fit'
						onClick={handleDelete}>
						Confirm
					</button>
				</div>
			</dialog>
			{/* <div className='modal-box'>
				<h3 className='font-bold text-lg'>Confirm delete</h3>
				<p className='py-4'>Are you sure you want to delete this item?</p>
				<button
					type='button'
					className='btn btn-sm btn-primary-outline w-fit'
					onClick={handleDelete}>
					Confirm
				</button>
			</div> */}
		</>
	);
};

export default ModalDeleteConfirmation;

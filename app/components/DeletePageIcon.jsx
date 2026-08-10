'use client';

import { useState, useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import { TrashIcon } from '@radix-ui/react-icons';

const DeletePageIcon = ({ page }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { fetchCurrentPages, currentJob } = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	const handleDeletePage = async () => {
		const { error } = await supabase.from('pages').delete().eq('id', page.id);
		if (error) {
			console.error(error);
			setAlert('Unable to delete page', 'error');
			return;
		}
		setAlert('Page deleted', 'success');
		fetchCurrentPages(currentJob);
		setIsModalOpen(false);
	};

	return (
		<>
			<div
				role='button'
				className='btn btn-ghost btn-sm btn-square hidden group-hover:flex transition-opacity duration-200'
				onClick={() => setIsModalOpen(true)}>
				<TrashIcon className='size-3.5' />
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Delete page'>
				<div className='pb-4'>
					<p>
						Are you sure you want to delete{' '}
						{page ? (
							<span className='font-bold'>{page.title}</span>
						) : (
							<span className='text-error'>Error</span>
						)}
						? <br /> This cannot be undone.
					</p>
				</div>
				<div className='flex justify-end'>
					<button
						type='button'
						className='btn btn-outline btn-error'
						onClick={handleDeletePage}>
						Confirm
					</button>
				</div>
			</Modal>
		</>
	);
};

export default DeletePageIcon;

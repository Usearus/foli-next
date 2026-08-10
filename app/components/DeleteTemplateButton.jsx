'use client';

import { useState } from 'react';
import { TrashIcon } from '@radix-ui/react-icons';
import Modal from './Modal';

const DeleteTemplateButton = ({ template, onDelete }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleConfirm = () => {
		onDelete(template);
		setIsModalOpen(false);
	};

	return (
		<>
			<button
				type='button'
				className='btn btn-ghost btn-sm btn-square shrink-0 text-error opacity-0 group-hover:opacity-100 transition-opacity'
				onClick={(event) => {
					event.stopPropagation();
					setIsModalOpen(true);
				}}
				aria-label={`Delete ${template.title} template`}>
				<TrashIcon className='size-3.5' />
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Delete template'>
				<div className='pb-4'>
					<p>
						Are you sure you want to delete{' '}
						<span className='font-bold'>{template.title}</span>? This cannot be
						undone.
					</p>
				</div>
				<div className='flex justify-end'>
					<button
						type='button'
						className='btn btn-outline btn-error'
						onClick={handleConfirm}>
						Confirm
					</button>
				</div>
			</Modal>
		</>
	);
};

export default DeleteTemplateButton;

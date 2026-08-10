'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children, title, closeButton = true }) => {
	if (!isOpen) return null;

	const modalContent = (
		<div className='z-110 fixed inset-0 bg-black/40 flex items-center justify-center'>
			<div className='bg-base-100 p-6 rounded-2xl shadow-sm w-full max-w-[95vw] md:max-w-150'>
				<div className='flex justify-between items-center'>
					<h2 className='text-xl font-semibold py-1'>{title}</h2>
					{closeButton ? (
						<button type='button' className='btn btn-ghost' onClick={onClose}>
							<Cross1Icon />
						</button>
					) : null}
				</div>
				<div className='modal-form mt-4 max-h-[75vh] overflow-y-auto [&_.input]:input-lg [&_.select]:select-lg [&_.textarea]:textarea-lg [&_.checkbox]:checkbox-lg'>
					{children}
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export default Modal;

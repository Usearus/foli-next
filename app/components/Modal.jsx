'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children, title, closeButton = true }) => {
	if (!isOpen) return null;

	const modalContent = (
		<div className='z-50 fixed inset-0 bg-[#0f1214] bg-opacity-70 flex items-center justify-center'>
			<div className='bg-base-300 p-6 rounded-2xl shadow-sm w-full max-w-[95vw] md:max-w-[600px]'>
				<div className='flex justify-between items-center'>
					<h2 className='text-xl font-semibold py-1'>{title}</h2>
					{closeButton ? (
						<button
							type='button'
							className='btn btn-sm btn-ghost'
							onClick={onClose}>
							<Cross1Icon />
						</button>
					) : null}
				</div>
				<div className='mt-4 max-h-[75vh] overflow-y-auto'>{children}</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export default Modal;

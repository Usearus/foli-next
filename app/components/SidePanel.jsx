'use client';

import { useState, useEffect } from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import { createPortal } from 'react-dom';

const SidePanel = ({
	isOpen,
	onClose,
	children,
	title,
	closeButton = true,
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [animation, setAnimation] = useState('');

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			setAnimation('animate-slide-in-right');
		} else {
			setAnimation('animate-slide-out-right');
			const timeout = setTimeout(() => setIsVisible(false), 500);
			return () => clearTimeout(timeout);
		}
	}, [isOpen]);

	if (!isVisible) return null;

	const sidePanelContent = (
		<div
			className='z-50 fixed inset-0 bg-black/40 flex justify-end animate-fade-in'
			onClick={onClose}>
			<div
				className={`w-full bg-base-100 p-4 lg:p-6 shadow-sm max-w-175 h-full ${animation}`}
				onClick={(event) => event.stopPropagation()}>
				<div className='flex justify-between items-center pb-4'>
					<h2 className='text-xl font-semibold py-1'>{title}</h2>
					{closeButton ? (
						<button type='button' className='btn btn-ghost' onClick={onClose}>
							<Cross1Icon />
						</button>
					) : null}
				</div>
				<div className='h-full pb-24.5 overflow-y-auto'>{children}</div>
			</div>
		</div>
	);

	return createPortal(sidePanelContent, document.body);
};

export default SidePanel;

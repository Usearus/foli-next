'use client';

import {
	useState,
	useRef,
	useEffect,
	useLayoutEffect,
	useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { JOB_STATUSES } from '../lib/jobStatuses';
import useJobStatusUpdate from '../hooks/useJobStatusUpdate';

const MENU_GAP = 4;

const JobStatusDropdown = ({
	job,
	buttonClassName = 'btn btn-outline flex justify-between min-w-32',
}) => {
	const updateStatus = useJobStatusUpdate(job);
	const [isOpen, setIsOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState({});
	const buttonRef = useRef(null);
	const menuRef = useRef(null);

	const updateMenuPosition = useCallback(() => {
		const button = buttonRef.current;
		const menu = menuRef.current;
		if (!button) return;

		const rect = button.getBoundingClientRect();
		const menuHeight = menu?.offsetHeight ?? 320;
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUpward = spaceBelow < menuHeight + MENU_GAP;

		setMenuStyle({
			position: 'fixed',
			top: openUpward ? rect.top - menuHeight - MENU_GAP : rect.bottom + MENU_GAP,
			left: rect.right,
			transform: 'translateX(-100%)',
			zIndex: 9999,
		});
	}, []);

	useLayoutEffect(() => {
		if (!isOpen) return;

		updateMenuPosition();
		const frame = requestAnimationFrame(updateMenuPosition);

		window.addEventListener('resize', updateMenuPosition);
		window.addEventListener('scroll', updateMenuPosition, true);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('resize', updateMenuPosition);
			window.removeEventListener('scroll', updateMenuPosition, true);
		};
	}, [isOpen, updateMenuPosition]);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event) => {
			if (
				buttonRef.current?.contains(event.target) ||
				menuRef.current?.contains(event.target)
			) {
				return;
			}

			setIsOpen(false);
		};

		document.addEventListener('mousedown', handlePointerDown);
		return () => document.removeEventListener('mousedown', handlePointerDown);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	const closeMenu = () => setIsOpen(false);

	const handleStatusChange = async (newStatus, event) => {
		event.preventDefault();
		event.stopPropagation();

		if (!job?.id || newStatus === job.status) {
			closeMenu();
			return;
		}

		await updateStatus(newStatus);
		closeMenu();
	};

	const menu = isOpen
		? createPortal(
					<ul
						ref={menuRef}
						style={menuStyle}
						className='menu bg-base-200 rounded-box w-52 p-2 shadow-lg border border-base-300'>
						{JOB_STATUSES.map((status) => (
							<li key={status}>
								<a
									className={status === job.status ? 'menu-active' : undefined}
									onClick={(event) => handleStatusChange(status, event)}>
									{status}
								</a>
							</li>
						))}
					</ul>,
					document.body,
				)
			: null;

	return (
		<>
			<button
				ref={buttonRef}
				type='button'
				className={buttonClassName}
				onClick={(event) => {
					event.stopPropagation();
					setIsOpen((open) => !open);
				}}
				aria-expanded={isOpen}
				aria-haspopup='menu'>
				{job.status} <ChevronDownIcon />
			</button>
			{menu}
		</>
	);
};

export default JobStatusDropdown;

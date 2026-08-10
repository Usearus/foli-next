'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlusIcon } from '@radix-ui/react-icons';
import { useFocusMode } from '../context/FocusModeContext';
import { useAddPage } from '../hooks/useAddPage';
import TemplateSidePanel from './TemplateSidePanel';
import AiAssistModal from './AiAssistModal';

const AddPageFab = () => {
	const { focusPageId } = useFocusMode();
	const [isFabOpen, setIsFabOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const fabTriggerRef = useRef(null);
	const {
		isTemplatePanelOpen,
		setIsTemplatePanelOpen,
		openTemplatePanel,
		openAiModal,
		isAiModalOpen,
		setIsAiModalOpen,
		handleCreateAiPage,
		currentJob,
		addBlankPage,
	} = useAddPage();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const closeFab = useCallback(() => {
		setIsFabOpen(false);
		fabTriggerRef.current?.blur();
	}, []);

	const toggleFab = useCallback(() => {
		setIsFabOpen((open) => !open);
	}, []);

	useEffect(() => {
		if (!isFabOpen) {
			return;
		}

		const handleScroll = () => {
			closeFab();
		};

		window.addEventListener('scroll', handleScroll, true);

		return () => {
			window.removeEventListener('scroll', handleScroll, true);
		};
	}, [isFabOpen, closeFab]);

	const handleBlankPage = () => {
		closeFab();
		addBlankPage();
	};

	const handleTemplate = () => {
		closeFab();
		openTemplatePanel();
	};

	const handleAiAssistant = () => {
		closeFab();
		openAiModal();
	};

	const handleTriggerKeyDown = (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleFab();
		}

		if (event.key === 'Escape') {
			closeFab();
		}
	};

	if (focusPageId) {
		return null;
	}

	return (
		<>
			<TemplateSidePanel
				isOpen={isTemplatePanelOpen}
				onClose={() => setIsTemplatePanelOpen(false)}
			/>
			<AiAssistModal
				isOpen={isAiModalOpen}
				onClose={() => setIsAiModalOpen(false)}
				mode='create'
				jobId={currentJob?.id}
				onCreatePage={handleCreateAiPage}
			/>
			{isMounted && isFabOpen
				? createPortal(
						<div
							className='fixed inset-0 z-998 bg-black/40 md:hidden'
							aria-hidden='true'
						/>,
						document.body,
					)
				: null}
			<div
				className={`fab add-page-fab md:hidden ${
					isFabOpen ? 'add-page-fab--open' : ''
				}`}>
				<div
					ref={fabTriggerRef}
					tabIndex={0}
					role='button'
					className='btn btn-lg btn-circle btn-primary'
					aria-label={isFabOpen ? 'Close add page menu' : 'Add page'}
					aria-expanded={isFabOpen}
					onClick={toggleFab}
					onKeyDown={handleTriggerKeyDown}>
					<PlusIcon
						className={`size-6 transition-transform duration-200 ${
							isFabOpen ? 'rotate-45' : ''
						}`}
					/>
				</div>
				<div>
					Blank page{' '}
					<button
						type='button'
						className='btn btn-lg btn-circle'
						onClick={handleBlankPage}
						aria-label='Add blank page'>
						B
					</button>
				</div>
				<div>
					Use template{' '}
					<button
						type='button'
						className='btn btn-lg btn-circle'
						onClick={handleTemplate}
						aria-label='Add page from template'>
						T
					</button>
				</div>
				<div>
					Use AI assistant{' '}
					<button
						type='button'
						className='btn btn-lg btn-circle'
						onClick={handleAiAssistant}
						aria-label='Create page with AI assistant'>
						A
					</button>
				</div>
			</div>
		</>
	);
};

export default AddPageFab;

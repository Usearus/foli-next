'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useAlert from '../alerts/useAlert';
import {
	duplicateMasterResumeForJob,
	getMasterResumeContent,
	updateMasterResumeTemplate,
} from '../lib/masterResumeTemplate';
import AiAssistBtn from './AiAssistBtn';
import Modal from './Modal';
import { DEFAULT_USER } from '../config/user';

const ReactQuillEditor = dynamic(() => import('./ReactQuillEditor'), {
	ssr: false,
});

const EDIT_TRANSITION_MS = 400;

const MasterResumeSheet = ({
	template,
	selectedJob,
	editing,
	isTailoring = false,
	onEditingChange,
	onTemplateUpdate,
}) => {
	const { setAlert } = useAlert();

	const [isFooterExiting, setIsFooterExiting] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isAddingToJob, setIsAddingToJob] = useState(false);
	const wasEditingRef = useRef(false);

	const savedContent = getMasterResumeContent(template);
	const [content, setContent] = useState(savedContent);

	useEffect(() => {
		if (editing) {
			return;
		}

		setContent(savedContent);
	}, [savedContent, editing]);

	useEffect(() => {
		if (editing) {
			wasEditingRef.current = true;
			setIsFooterExiting(false);
			return;
		}

		if (!wasEditingRef.current) {
			return;
		}

		wasEditingRef.current = false;
		setIsFooterExiting(true);

		const timer = window.setTimeout(() => {
			setIsFooterExiting(false);
		}, EDIT_TRANSITION_MS);

		return () => window.clearTimeout(timer);
	}, [editing]);

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (editing) {
				event.preventDefault();
				event.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [editing]);

	const showFooter = editing || isFooterExiting;

	const stopEditing = () => {
		onEditingChange?.(false);
	};

	const handleCancelClick = () => {
		setContent(savedContent);
		stopEditing();
	};

	const handleSaveClick = async () => {
		if (!template?.id) {
			setAlert('Resume template not ready yet. Try again in a moment.', 'warning');
			return;
		}

		const { data, error } = await updateMasterResumeTemplate(
			template.id,
			content,
		);

		if (error) {
			console.error(error);
			setAlert('Unable to save resume', 'error');
			return;
		}

		setAlert('Resume saved', 'success');
		onTemplateUpdate?.(data);
		stopEditing();
	};

	const handleAiApply = (html) => {
		setContent(html);
		onEditingChange?.(true);
	};

	const handleAddToJobClick = () => {
		if (!selectedJob?.id) {
			setAlert('Select a job first', 'warning');
			return;
		}

		setIsAddModalOpen(true);
	};

	const handleConfirmAddToJob = async () => {
		if (!selectedJob?.id) {
			return;
		}

		setIsAddingToJob(true);

		const { error } = await duplicateMasterResumeForJob({
			jobId: selectedJob.id,
			account: DEFAULT_USER.email,
			content,
		});

		setIsAddingToJob(false);

		if (error) {
			console.error(error);
			setAlert('Unable to add resume to this job', 'error');
			return;
		}

		setAlert(
			`Resume added to ${selectedJob.company} — ${selectedJob.position}`,
			'success',
		);
		setIsAddModalOpen(false);
		stopEditing();
	};

	return (
		<>
			<Modal
				isOpen={isAddModalOpen}
				onClose={() => {
					if (isAddingToJob) return;
					setIsAddModalOpen(false);
				}}
				title='Add resume to job'>
				<div className='flex flex-col gap-4'>
					<p className='text-base-content/80'>
						This resume will be added as a new page on:
					</p>
					<p className='text-lg font-semibold'>
						{selectedJob?.company} — {selectedJob?.position}
					</p>
					<div className='flex justify-end gap-2 pt-2'>
						<button
							type='button'
							className='btn btn-ghost'
							onClick={() => setIsAddModalOpen(false)}
							disabled={isAddingToJob}>
							Cancel
						</button>
						<button
							type='button'
							className='btn btn-primary'
							onClick={handleConfirmAddToJob}
							disabled={isAddingToJob}>
							{isAddingToJob ? (
								<span className='loading loading-spinner loading-sm' />
							) : null}
							Confirm
						</button>
					</div>
				</div>
			</Modal>
			<article className='page-sheet-container bg-base-100 h-full w-full min-h-0 max-w-full p-8 flex flex-col gap-2 shadow-sm'>
			<div className='page-sheet-header flex items-center gap-1 pt-2 min-w-0'>
				<span className='page-sheet-title font-bold pl-6 flex-1 min-w-0'>
					Master Resume
				</span>
				<div className='page-sheet-actions shrink-0 flex justify-end gap-0 z-30 pr-6 sm:pr-0'>
					<AiAssistBtn
						templateId={template?.id}
						jobId={selectedJob?.id}
						onApply={handleAiApply}
					/>
				</div>
			</div>
			<div className='border-t border-base-content/10' aria-hidden='true' />

			<div
				className={`flex flex-col flex-1 min-h-0 ${
					showFooter ? 'justify-between' : ''
				}`}>
				<div className='page-scroll page-sheet flex-1 min-h-0'>
					<div
						className={`page-sheet-editor ${
							editing ? 'page-sheet-editing-mode' : 'page-sheet-view-mode'
						}`}>
						<ReactQuillEditor
							value={content}
							onChange={setContent}
							readOnly={!editing}
						/>
					</div>
				</div>

				{showFooter ? (
					<div
						className={`page-sheet-footer flex justify-end gap-2 pt-2 shrink-0 ${
							isFooterExiting
								? 'page-sheet-footer-exiting pointer-events-none'
								: 'page-sheet-footer-enter'
						}`}>
						<button
							type='button'
							className='btn btn-ghost btn-secondary w-fit'
							onClick={handleCancelClick}
							tabIndex={isFooterExiting ? -1 : 0}>
							Cancel
						</button>
						<button
							type='button'
							className='btn btn-primary w-fit'
							onClick={isTailoring ? handleAddToJobClick : handleSaveClick}
							tabIndex={isFooterExiting ? -1 : 0}>
							{isTailoring ? 'Add resume to job' : 'Save resume'}
						</button>
					</div>
				) : null}
			</div>
		</article>
		</>
	);
};

export default MasterResumeSheet;

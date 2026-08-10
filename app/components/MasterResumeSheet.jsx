'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useAlert from '../alerts/useAlert';
import { DEFAULT_USER } from '../config/user';
import {
	duplicateMasterResumeForJob,
	getMasterResumeContent,
	updateMasterResumeTemplate,
} from '../lib/masterResumeTemplate';

const ReactQuillEditor = dynamic(() => import('./ReactQuillEditor'), {
	ssr: false,
});

const EDIT_TRANSITION_MS = 400;

const MasterResumeSheet = ({
	template,
	selectedJob,
	onTemplateUpdate,
}) => {
	const { setAlert } = useAlert();

	const [editing, setEditing] = useState(false);
	const [isDuplicating, setIsDuplicating] = useState(false);
	const [isFooterExiting, setIsFooterExiting] = useState(false);
	const wasEditingRef = useRef(false);
	const editingRef = useRef(editing);
	editingRef.current = editing;

	const savedContent = getMasterResumeContent(template);
	const [content, setContent] = useState(savedContent);

	useEffect(() => {
		if (editingRef.current) {
			return;
		}

		setContent(savedContent);
	}, [savedContent]);

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

	const handleCancelClick = () => {
		setContent(savedContent);
		setEditing(false);
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
		setEditing(false);
	};

	const handleDuplicateClick = async () => {
		if (!selectedJob?.id) {
			setAlert('Select a job first', 'warning');
			return;
		}

		if (editing) {
			setAlert('Save or cancel your edits before duplicating', 'warning');
			return;
		}

		setIsDuplicating(true);

		const { error } = await duplicateMasterResumeForJob({
			jobId: selectedJob.id,
			account: DEFAULT_USER.email,
			content: savedContent,
		});

		setIsDuplicating(false);

		if (error) {
			console.error(error);
			setAlert('Unable to duplicate resume for this job', 'error');
			return;
		}

		setAlert(
			`Resume added to ${selectedJob.company} — ${selectedJob.position}`,
			'success',
		);
	};

	return (
		<article className='page-sheet-container bg-base-100 h-full w-full min-h-0 p-8 flex flex-col gap-2 shadow-sm'>
			<div className='flex flex-col gap-3 shrink-0 pt-2'>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
					<span className='page-sheet-title font-bold pl-6'>Master Resume</span>
					{!editing ? (
						<div className='flex flex-wrap gap-2 px-6 sm:px-0 sm:pr-0 sm:justify-end'>
							<button
								type='button'
								className='btn btn-outline btn-sm sm:btn-md'
								onClick={handleDuplicateClick}
								disabled={!selectedJob || isDuplicating}>
								{isDuplicating ? (
									<span className='loading loading-spinner loading-sm' />
								) : null}
								Duplicate for job
							</button>
							<button
								type='button'
								className='btn btn-primary btn-sm sm:btn-md rounded-full'
								onClick={() => setEditing(true)}>
								Edit master resume
							</button>
						</div>
					) : null}
				</div>
				{!editing ? (
					selectedJob ? (
						<div
							className='mx-6 rounded-lg border border-base-300 bg-base-200/60 px-3 py-2 text-sm'
							role='status'>
							<span className='text-base-content/60'>Duplicate target: </span>
							<span className='font-medium'>
								{selectedJob.company} — {selectedJob.position}
							</span>
						</div>
					) : (
						<p className='text-sm text-base-content/60 px-6'>
							Select a job in the panel on the left to choose where a duplicate
							Resume page will be added.
						</p>
					)
				) : null}
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
							className='btn btn-primary rounded-full w-fit'
							onClick={handleSaveClick}
							tabIndex={isFooterExiting ? -1 : 0}>
							Save resume
						</button>
					</div>
				) : null}
			</div>
		</article>
	);
};

export default MasterResumeSheet;

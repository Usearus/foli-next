'use client';

import { useEffect, useRef, useState } from 'react';
import { TrashIcon } from '@radix-ui/react-icons';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import Loader from './Loader';
import { formatAiReply } from '../lib/ai/formatAiReply';
import {
	deletePromptFromHistory,
	getPromptHistory,
	savePromptToHistory,
} from '../lib/ai/promptHistory';
import { PAGE_TITLE_MAX_CHAR } from '../lib/ai/pageTitle';

const EDIT_QUICK_PROMPTS = [
	'Improve the writing while keeping my voice.',
	'Make this more concise.',
	'Tailor this content to the current job.',
];

const CREATE_QUICK_PROMPTS = [
	'Compare my experience to this job description.',
	'Draft a cover letter for this role.',
	'Create interview prep notes for this job.',
];

const AiAssistModal = ({
	isOpen,
	onClose,
	mode = 'edit',
	pageId,
	templateId,
	jobId,
	onApply,
	onCreatePage,
}) => {
	const isCreateMode = mode === 'create';
	const { setAlert } = useAlert();
	const [isLoading, setIsLoading] = useState(false);
	const [isCreatingPage, setIsCreatingPage] = useState(false);
	const [reply, setReply] = useState('');
	const [lastPrompt, setLastPrompt] = useState('');
	const [savedPrompts, setSavedPrompts] = useState([]);
	const promptRef = useRef(null);
	const fieldId = `ai-assist-prompt-${pageId ?? templateId ?? 'new-page'}`;

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setSavedPrompts(getPromptHistory());
		setReply('');
		setLastPrompt('');
	}, [isOpen]);

	const handleClose = () => {
		if (isLoading || isCreatingPage) return;
		onClose();
		setReply('');
		setLastPrompt('');
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const message = promptRef.current?.value?.trim();
		if (!message) {
			setAlert('Enter a prompt for the AI', 'error');
			return;
		}

		setIsLoading(true);
		setReply('');

		try {
			const response = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message,
					jobId: jobId ?? undefined,
					pageId: isCreateMode ? undefined : (pageId ?? undefined),
					templateId: isCreateMode ? undefined : (templateId ?? undefined),
					createPage: isCreateMode,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setAlert(data.error ?? 'Unable to get an AI response', 'error');
				return;
			}

			setLastPrompt(message);
			setSavedPrompts(savePromptToHistory(message));
			setReply(data.reply ?? '');
		} catch (error) {
			console.error(error);
			setAlert('Unable to get an AI response', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleApply = () => {
		if (!reply) return;
		onApply?.(formatAiReply(reply));
		handleClose();
		setAlert('AI suggestion applied — review and save when ready', 'success');
	};

	const handleCreatePage = async () => {
		if (!reply || !lastPrompt) return;

		setIsCreatingPage(true);

		try {
			const formattedContent = formatAiReply(reply);
			const titleResponse = await fetch('/api/ai/infer-title', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: lastPrompt,
					content: formattedContent,
				}),
			});

			const titleData = await titleResponse.json();

			if (!titleResponse.ok) {
				setAlert(titleData.error ?? 'Unable to infer a page title', 'error');
				return;
			}

			await onCreatePage?.({
				title: titleData.title?.slice(0, PAGE_TITLE_MAX_CHAR) ?? 'AI Page',
				content: formattedContent,
			});
			handleClose();
		} catch (error) {
			console.error(error);
			setAlert('Unable to create page', 'error');
		} finally {
			setIsCreatingPage(false);
		}
	};

	const formattedReply = reply ? formatAiReply(reply) : '';
	const quickPrompts = isCreateMode ? CREATE_QUICK_PROMPTS : EDIT_QUICK_PROMPTS;
	const isBusy = isLoading || isCreatingPage;

	const handleQuickPrompt = (prompt) => {
		if (promptRef.current) {
			promptRef.current.value = prompt;
		}
	};

	const handleUseSavedPrompt = (prompt) => {
		if (promptRef.current) {
			promptRef.current.value = prompt;
			promptRef.current.focus();
		}
	};

	const handleDeleteSavedPrompt = (event, id) => {
		event.stopPropagation();
		setSavedPrompts(deletePromptFromHistory(id));
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={isCreateMode ? 'Create page with AI' : 'Ask AI'}>
			<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
				<fieldset className='fieldset'>
					<label className='label' htmlFor={fieldId}>
						What should Foli do?
					</label>
					<textarea
						id={fieldId}
						ref={promptRef}
						className='textarea textarea-bordered w-full min-h-28 bg-base-200'
						placeholder={
							isCreateMode
								? 'Example: Compare my background to this job description and highlight the strongest matches.'
								: 'Example: Rewrite the opening paragraph to sound more confident and specific to this role.'
						}
						disabled={isBusy}
					/>
				</fieldset>

				<div className='flex flex-wrap gap-2'>
					{quickPrompts.map((prompt) => (
						<button
							key={prompt}
							type='button'
							className='btn btn-sm btn-outline'
							onClick={() => handleQuickPrompt(prompt)}
							disabled={isBusy}>
							{prompt}
						</button>
					))}
				</div>

				{savedPrompts.length > 0 ? (
					<fieldset className='fieldset'>
						<label className='label'>Saved prompts</label>
						<div className='flex flex-wrap gap-2 max-h-40 overflow-y-auto'>
							{savedPrompts.map((item) => (
								<div key={item.id} className='join items-stretch max-w-full'>
									<button
										type='button'
										className='btn btn-sm btn-outline join-item h-auto min-h-8 py-2 font-normal text-left whitespace-normal'
										onClick={() => handleUseSavedPrompt(item.text)}
										disabled={isBusy}
										title={item.text}>
										<span className='line-clamp-2'>{item.text}</span>
									</button>
									<button
										type='button'
										className='btn btn-sm btn-outline join-item h-auto min-h-8 w-9 min-w-9 shrink-0 self-stretch p-0 text-error'
										onClick={(event) =>
											handleDeleteSavedPrompt(event, item.id)
										}
										disabled={isBusy}
										aria-label='Delete saved prompt'>
										<TrashIcon className='size-4' />
									</button>
								</div>
							))}
						</div>
					</fieldset>
				) : null}

				{isBusy ? (
					<div className='flex justify-center py-6'>
						<Loader />
					</div>
				) : null}

				{formattedReply ? (
					<fieldset className='fieldset'>
						<label className='label'>Suggestion</label>
						<div
							className='markdown-content page-sheet-prose ql-editor rounded-lg border border-base-content/10 bg-base-200 p-4 max-h-64 overflow-y-auto text-sm'
							dangerouslySetInnerHTML={{ __html: formattedReply }}
						/>
					</fieldset>
				) : null}

				<div className='flex justify-end gap-2'>
					<button
						type='button'
						className='btn btn-ghost'
						onClick={handleClose}
						disabled={isBusy}>
						Cancel
					</button>
					{reply ? (
						isCreateMode ? (
							<button
								type='button'
								className='btn btn-primary'
								onClick={handleCreatePage}
								disabled={isBusy}>
								Create page
							</button>
						) : (
							<button
								type='button'
								className='btn btn-primary'
								onClick={handleApply}
								disabled={isBusy}>
								Apply & edit
							</button>
						)
					) : (
						<button type='submit' className='btn btn-primary' disabled={isBusy}>
							Generate
						</button>
					)}
				</div>
			</form>
		</Modal>
	);
};

export default AiAssistModal;

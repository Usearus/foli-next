'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DatabaseContext } from '../context/DatabaseContext';
import { useFocusMode } from '../context/FocusModeContext';
import dynamic from 'next/dynamic';

const ReactQuillEditor = dynamic(() => import('./ReactQuillEditor'), {
	ssr: false,
});
import useAlert from '../alerts/useAlert';
import DeletePageBtn from './DeletePageBtn';
import SaveAsTemplateBtn from './SaveAsTemplateBtn';
import HidePageBtn from './HidePageBtn';
import AiAssistBtn from './AiAssistBtn';
import FocusModeOverlay from './FocusModeOverlay';
import {
	DotsVerticalIcon,
	EnterFullScreenIcon,
	ExitFullScreenIcon,
	Pencil1Icon,
} from '@radix-ui/react-icons';
import { supabase } from '../api/supabase';
import { Resizable } from 're-resizable';
import { DEFAULT_PAGE_WIDTH, MIN_PAGE_WIDTH } from '../lib/pageDefaults';
import {
	PAGE_TITLE_PLACEHOLDER,
	getPageTitleLabel,
	isPageTitleEmpty,
} from '../lib/ai/pageTitle';

const EDIT_TRANSITION_MS = 400;
const FOCUS_MODE_MAX_WIDTH = 700;
const RESIZE_EDGE_PX = 20;

const SinglePage = (page) => {
	// Context Variables
	const { fetchCurrentPages, currentJob, pendingEditPageId, setPendingEditPageId } =
		useContext(DatabaseContext);
	const { focusPageId, focusOrigin, isFocusExiting, enterFocusMode, exitFocusMode, completeFocusExit } =
		useFocusMode();
	const { setAlert } = useAlert();
	const isFocusMode = focusPageId === page.id;
	const sheetRef = useRef(null);

	// Modals
	const [showEditPageModal, setShowEditPageModal] = useState(false);

	const handleOpenPageModalClick = () => {
		setShowEditPageModal(true);
	};

	// PAGE FUNCTIONS
	const initialVisibleValue = page.visible;
	// Check width on load and render mobile or desktop pages
	const isMobile = window.matchMedia('(max-width: 768px)').matches;

	// Resizing
	const [pageWidth, setPageWidth] = useState(page.width || DEFAULT_PAGE_WIDTH);

	useEffect(() => {
		// Function to fetch and set the page width from the database
		const fetchPageWidth = async () => {
			try {
				const { data, error } = await supabase
					.from('pages')
					.select('width')
					.eq('id', page.id)
					.single();

				if (error) throw error;
				setPageWidth(data.width ?? DEFAULT_PAGE_WIDTH);
			} catch (error) {
				console.error('Error fetching page width:', error);
			}
		};

		fetchPageWidth(); // Fetch width on component mount
	}, [page.id]);

	const handleUpdateWidthClick = async (newPageWidth) => {
		setPageWidth(newPageWidth);
		const { error } = await supabase
			.from('pages')
			.update({
				width: newPageWidth,
			})
			.eq('id', page.id);

		if (error) {
			setAlert('Unable to update page width.', 'danger');
			console.log('error is', error);
		}
	};

	// EDITING PAGE FUNCTIONS
	const [editing, setEditing] = useState(false);
	const [isFooterExiting, setIsFooterExiting] = useState(false);
	const wasEditingRef = useRef(false);
	const editingRef = useRef(editing);
	editingRef.current = editing;
	const [isMounted, setIsMounted] = useState(false);
	const [showResizeHandle, setShowResizeHandle] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (editingRef.current) {
			return;
		}

		setContent(page.content);
		if (titleRef.current) {
			titleRef.current.value = page.title ?? '';
		}
	}, [page.content, page.title]);

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

	const showFooter = editing || isFooterExiting;

	const handleSheetMouseMove = (event) => {
		if (window.matchMedia('(max-width: 768px)').matches) {
			return;
		}

		const bounds = sheetRef.current?.getBoundingClientRect();
		if (!bounds) {
			return;
		}

		const nearRightEdge =
			event.clientX >= bounds.right - RESIZE_EDGE_PX &&
			event.clientX <= bounds.right + 4;
		setShowResizeHandle(nearRightEdge);
	};

	const handleSheetMouseLeave = () => {
		setShowResizeHandle(false);
	};

	const handleAiApply = (html) => {
		setContent(html);
		setEditing(true);
	};

	const handleEditClick = () => {
		setEditing(true);
	};

	const handleFocusClick = () => {
		const rect = sheetRef.current?.getBoundingClientRect?.();
		if (rect) {
			enterFocusMode(page.id, {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
			});
		} else {
			enterFocusMode(page.id, null);
		}
		handleEditClick();
	};

	const handleExitFocusClick = () => {
		exitFocusMode();
	};

	const stopEditing = () => {
		setEditing(false);
		if (focusPageId === page.id) {
			exitFocusMode();
		}
	};

	const handleCancelClick = () => {
		setContent(page.content);
		if (titleRef.current) {
			titleRef.current.value = page.title ?? '';
		}
		setShowEditPageModal(false);
		stopEditing();
	};

	const closeEditorWarning = (event) => {
		if (editing) {
			event.preventDefault();
			event.returnValue = '';
		}
	};

	// ATTEMPTING TO PREVENT USER FROM LEAVING IF EDITING IS TRUE
	useEffect(() => {
		const handleBeforeUnload = (event) => {
			closeEditorWarning(event);
		};

		const handlePopstate = (event) => {
			closeEditorWarning(event);
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('popstate', handlePopstate);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('popstate', handlePopstate);
		};
	}, [editing]);

	useEffect(() => {
		if (!isFocusMode) {
			return;
		}

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				setContent(page.content);
				if (titleRef.current) {
					titleRef.current.value = page.title ?? '';
				}
				setShowEditPageModal(false);
				stopEditing();
			}
		};

		window.addEventListener('keydown', handleEscape);

		return () => window.removeEventListener('keydown', handleEscape);
	}, [
		isFocusMode,
		page.content,
		page.title,
		focusPageId,
		page.id,
		exitFocusMode,
	]);

	// React Quill Editor Variables & Functions
	const [content, setContent] = useState(page.content);

	// Editing title
	const initialTitleValue = page.title ?? '';
	const titleRef = useRef(null);
	const titleMaxChar = 32;

	useEffect(() => {
		if (pendingEditPageId !== page.id) {
			return;
		}

		setPendingEditPageId(null);
		setEditing(true);

		requestAnimationFrame(() => {
			titleRef.current?.focus();
		});
	}, [pendingEditPageId, page.id, setPendingEditPageId]);

	const handleEditorChange = (value) => {
		setContent(value);
	};

	const getDefaultTemplateTitle = () =>
		(titleRef.current?.value ?? page.title ?? '').trim();

	const handleUpdateContentClick = async () => {
		if (page.locked) {
			const { error } = await supabase
				.from('pages')
				.update({
					content: content,
				})
				.eq('id', page.id);

			if (error) {
				setAlert('Unable to update page', 'danger');
				console.log('error is', error);
				return;
			}

			setAlert('Page updated', 'success');
			await fetchCurrentPages(currentJob);
			setShowEditPageModal(false);
			stopEditing();
			return;
		}

		const { error } = await supabase
			.from('pages')
			.update({
				content: content,
				title: titleRef.current?.value ?? page.title,
			})
			.eq('id', page.id);

		if (error) {
			setAlert('Unable to update page', 'danger');
			console.log('error is', error);
			return;
		}

		setAlert('Page updated', 'success');
		await fetchCurrentPages(currentJob);
		setShowEditPageModal(false);
		stopEditing();
	};

	if (initialVisibleValue === false) {
		return <></>;
	}

	const sheetArticle = (
		<article
			className={`page-sheet-container bg-base-100 w-full min-h-0 p-8 flex flex-col gap-2 shadow-sm${
				editing ? ' page-sheet-container--editing' : ''
			}${isFocusMode ? ' page-sheet-container--focus-mode' : ''}`}>
			<div className='page-sheet-header flex items-center gap-1 pt-2 min-w-0'>
				{page.locked ? (
					<label className='input input-ghost flex flex-1 min-w-0 items-center gap-2 mb-0.5 pl-6 pointer-events-none'>
						<span
							className={`page-sheet-title page-sheet-title-text font-bold ${
								isPageTitleEmpty(page.title) ? 'text-base-content/50' : ''
							}`}>
							{getPageTitleLabel(page.title)}
						</span>
					</label>
				) : (
					<label
						className={`input input-ghost flex flex-1 min-w-0 items-center gap-2 mb-0.5 pl-6 ${
							editing ? '' : 'pointer-events-none'
						}`}>
						<input
							type='text'
							required={editing}
							readOnly={!editing}
							tabIndex={editing ? 0 : -1}
							ref={titleRef}
							defaultValue={initialTitleValue}
							maxLength={titleMaxChar}
							placeholder={
								editing ? 'Add page title' : PAGE_TITLE_PLACEHOLDER
							}
							className='page-sheet-title-input grow page-sheet-title font-bold pl-0 min-w-0 w-full placeholder:text-base-content/50'
							aria-readonly={!editing}
						/>
					</label>
				)}
				<div className='page-sheet-actions shrink-0 flex justify-end gap-0 z-30'>
					<AiAssistBtn
						pageId={page.id}
						jobId={currentJob?.id}
						onApply={handleAiApply}
					/>
					{isFocusMode ? (
						<button
							type='button'
							className='btn btn-ghost'
							onClick={handleExitFocusClick}
							aria-label='Exit focus mode'>
							<ExitFullScreenIcon />
						</button>
					) : (
						<>
							<div
								className={`page-sheet-edit-btn-slot ${
									editing ? 'page-sheet-edit-btn-slot--collapsed' : ''
								}`}>
								<button
									type='button'
									className='btn btn-ghost'
									onClick={handleEditClick}
									aria-label='Edit page'
									tabIndex={editing ? -1 : 0}
									aria-hidden={editing}>
									<Pencil1Icon />
								</button>
							</div>
							{editing ? (
								<button
									type='button'
									className='btn btn-ghost'
									onClick={handleFocusClick}
									aria-label='Focus mode'>
									<EnterFullScreenIcon />
								</button>
							) : (
								<div className='dropdown dropdown-end'>
									<div tabIndex={0} role='button' className='btn btn-ghost'>
										<DotsVerticalIcon />
									</div>
									<ul
										tabIndex={0}
										className='dropdown-content menu bg-base-200 rounded-box z-50 w-52 p-2 shadow'>
										<li onClick={(event) => event.stopPropagation()}>
											<button
												type='button'
												className='flex items-center'
												onClick={handleFocusClick}>
												<EnterFullScreenIcon className='inline-block size-4 mr-2 shrink-0' />
												Focus mode
											</button>
										</li>
										{!page.locked ? (
											<li>
												<SaveAsTemplateBtn
													page={page}
													content={content}
													getDefaultTitle={getDefaultTemplateTitle}
												/>
											</li>
										) : null}
										<li onClick={(event) => event.stopPropagation()}>
											<HidePageBtn page={page} />
										</li>
										{!page.locked ? (
											<li>
												<DeletePageBtn page={page} />
											</li>
										) : null}
									</ul>
								</div>
							)}
						</>
					)}
				</div>
			</div>
			<div className='border-t border-base-content/10' aria-hidden='true' />

			<div
				className={`page-sheet-body flex flex-col flex-1 min-h-0 ${
					showFooter ? 'justify-between' : ''
				}`}>
				<div
					className={`page-scroll page-sheet ${
						isFocusMode ? 'focus-mode-page-scroll' : ''
					}`}>
					<div
						className={`page-sheet-editor ${
							editing ? 'page-sheet-editing-mode' : 'page-sheet-view-mode'
						}`}>
						<ReactQuillEditor
							value={content}
							onChange={handleEditorChange}
							readOnly={!editing}
						/>
					</div>
				</div>

				{showFooter ? (
					<div
						className={`page-sheet-footer flex justify-end gap-2 pt-2 ${
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
							onClick={handleUpdateContentClick}
							tabIndex={isFooterExiting ? -1 : 0}>
							Save page
						</button>
					</div>
				) : null}
			</div>
		</article>
	);

	if (isFocusMode) {
		return (
			<>
				<div
					ref={sheetRef}
					className='h-full invisible pointer-events-none'
					aria-hidden='true'>
					<Resizable
						enable={false}
						minWidth={`${MIN_PAGE_WIDTH}px`}
						maxWidth={`${FOCUS_MODE_MAX_WIDTH}px`}
						size={{
							height: '100%',
							width: pageWidth,
						}}>
						<div className='h-full' />
					</Resizable>
				</div>
				{isMounted
					? createPortal(
							<FocusModeOverlay
								origin={focusOrigin}
								isExiting={isFocusExiting}
								onExitComplete={completeFocusExit}>
								{sheetArticle}
							</FocusModeOverlay>,
							document.body,
						)
					: null}
			</>
		);
	}

	return (
		<div
			ref={sheetRef}
			className={`page-sheet-shell relative ${showResizeHandle ? 'cursor-col-resize' : ''}`}
			onMouseMove={handleSheetMouseMove}
			onMouseLeave={handleSheetMouseLeave}>
			<div
				className={`page-sheet-resize-handle ${
					showResizeHandle ? 'page-sheet-resize-handle--visible' : ''
				}`}
				aria-hidden='true'
			/>
			<Resizable
				enable={{
					top: false,
					right: true,
					bottom: false,
					left: false,
					topRight: false,
					bottomRight: false,
					bottomLeft: false,
					topLeft: false,
				}}
				onResize={(e, direction, ref) => {
					setPageWidth(ref.offsetWidth);
				}}
				onResizeStop={(e, direction, ref) => {
					handleUpdateWidthClick(ref.offsetWidth);
				}}
				minWidth={`${MIN_PAGE_WIDTH}px`}
				maxWidth={`${FOCUS_MODE_MAX_WIDTH}px`}
				className='page-sheet-resizable'
				size={{
					width: pageWidth,
				}}>
				{sheetArticle}
			</Resizable>
		</div>
	);
};

export default SinglePage;

'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DatabaseContext } from '../context/DatabaseContext';
import { useFocusMode } from '../context/FocusModeContext';
import dynamic from 'next/dynamic';

const ReactQuillEditor = dynamic(() => import('./ReactQuillEditor'), {
	ssr: false,
});
import MarkdownView from 'react-showdown';
import useAlert from '../alerts/useAlert';
import DeletePageBtn from './DeletePageBtn';
import FocusModeOverlay from './FocusModeOverlay';
import {
	DotsVerticalIcon,
	EnterFullScreenIcon,
	Pencil1Icon,
} from '@radix-ui/react-icons';
import { supabase } from '../api/supabase';
import { Resizable } from 're-resizable';

const EDIT_TRANSITION_MS = 400;
const FOCUS_MODE_MAX_WIDTH = 700;

const SinglePage = (page) => {
	// Context Variables
	const { fetchCurrentPages, currentJob } = useContext(DatabaseContext);
	const { focusPageId, focusOrigin, enterFocusMode, exitFocusMode } =
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
	const [pageWidth, setPageWidth] = useState(page.width || 400);

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
				setPageWidth(data.width); // Set the width from the database or fallback to '400px'
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
	const [editTransition, setEditTransition] = useState(null);
	const [showViewLayer, setShowViewLayer] = useState(true);
	const [showEditorLayer, setShowEditorLayer] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleEditClick = () => {
		setEditing(true);
		setEditTransition('enter');
		setShowViewLayer(true);
		setShowEditorLayer(true);
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

	const startExitEdit = () => {
		setShowViewLayer(true);
		setEditTransition('exit');
	};

	useEffect(() => {
		if (editTransition === 'enter') {
			const timer = setTimeout(() => {
				setEditTransition(null);
				setShowViewLayer(false);
			}, EDIT_TRANSITION_MS);
			return () => clearTimeout(timer);
		}

		if (editTransition === 'exit') {
			const timer = setTimeout(() => {
				setEditing(false);
				setEditTransition(null);
				setShowEditorLayer(false);
				setShowViewLayer(true);
				if (focusPageId === page.id) {
					exitFocusMode();
				}
			}, EDIT_TRANSITION_MS);
			return () => clearTimeout(timer);
		}
	}, [editTransition, exitFocusMode, focusPageId, page.id]);

	const handleCancelClick = () => {
		setContent(page.content);
		if (titleRef.current) {
			titleRef.current.value = page.title ?? '';
			setCharacterCount((page.title ?? '').length);
		}
		setShowEditPageModal(false);
		startExitEdit();
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
					setCharacterCount((page.title ?? '').length);
				}
				setShowEditPageModal(false);
				startExitEdit();
			}
		};

		window.addEventListener('keydown', handleEscape);

		return () => window.removeEventListener('keydown', handleEscape);
	}, [isFocusMode, page.content]);

	// React Quill Editor Variables & Functions
	const [content, setContent] = useState(page.content);

	// Editing title
	const initialTitleValue = page.title ?? '';
	const titleRef = useRef(null);
	const titleMaxChar = 32;
	const [characterCount, setCharacterCount] = useState(initialTitleValue.length);

	const handleTitleChange = (event) => {
		setCharacterCount(event.target.value.length);
	};

	const handleEditorChange = (value) => {
		setContent(value);
	};

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
			fetchCurrentPages(currentJob);
			setShowEditPageModal(false);
			startExitEdit();
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
		fetchCurrentPages(currentJob);
		setShowEditPageModal(false);
		startExitEdit();
	};

	if (initialVisibleValue === false) {
		return <></>;
	}

	const sheetArticle = (
		<article className='page-sheet-container bg-base-100 h-full w-full p-4 flex flex-col gap-2 shadow-sm'>
			{editing ? (
				<div className='flex justify-between pt-2'>
					{page.locked ? (
						<label className='page-sheet-title font-bold pl-4'>{page.title}</label>
					) : (
						<label className='input input-ghost input-xs flex grow items-center gap-2 mb-[2px] mr-2'>
							<input
								type='text'
								required
								ref={titleRef}
								defaultValue={initialTitleValue}
								maxLength={titleMaxChar}
								onChange={handleTitleChange}
								placeholder='Add page title'
								className='grow font-bold text-xl pl-2'
							/>
							<span className='label-text-alt shrink-0'>
								{characterCount}/{titleMaxChar}
							</span>
						</label>
					)}
				</div>
			) : (
				<div className='flex justify-between pt-2'>
					<label className='page-sheet-title font-bold pl-4'>{page.title}</label>
					<div className='page-sheet-actions flex justify-end gap-2'>
						{!isFocusMode ? (
							<>
								<button
									type='button'
									className='btn btn-xs btn-ghost'
									onClick={handleFocusClick}
									aria-label='Enter focus mode'>
									<EnterFullScreenIcon />
								</button>
								<button
									type='button'
									className='btn btn-xs btn-ghost'
									onClick={handleEditClick}
									aria-label='Edit page'>
									<Pencil1Icon />
								</button>
							</>
						) : null}
						{!page.locked && !isFocusMode ? (
							<div className='dropdown dropdown-end'>
								<div tabIndex={0} role='button' className='btn btn-xs btn-ghost'>
									<DotsVerticalIcon />
								</div>
								<ul
									tabIndex={0}
									className='dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow'>
									<li>
										<DeletePageBtn page={page} />
									</li>
								</ul>
							</div>
						) : null}
					</div>
				</div>
			)}
			<div className='border-t border-base-content/10' aria-hidden='true' />

			<div
				className={`flex flex-col ${editing ? 'justify-between h-full min-h-0' : 'h-full min-h-0'}`}>
				<div
					className={`page-scroll page-sheet ${editing ? 'page-sheet-editing' : ''} ${
						editTransition === 'enter' ? 'page-sheet-enter' : ''
					} ${editTransition === 'exit' ? 'page-sheet-exit' : ''} ${
						isFocusMode ? 'focus-mode-page-scroll' : ''
					}`}>
					{(showViewLayer || !editing) && (
						<div
							className={`page-sheet-view ${
								editTransition === 'enter' ? 'page-sheet-view-exiting' : ''
							} ${editTransition === 'exit' ? 'page-sheet-view-entering' : ''}`}>
							<MarkdownView
								className='markdown-content'
								markdown={
									editTransition === 'exit' || editing ? content : page.content
								}
							/>
						</div>
					)}
					{showEditorLayer ? (
						<div className='page-sheet-editor'>
							<ReactQuillEditor value={content} onChange={handleEditorChange} />
						</div>
					) : null}
				</div>

				{editing && editTransition !== 'exit' ? (
					<div className='flex justify-end gap-2 pt-2'>
						<button
							type='button'
							className='btn btn-sm btn-ghost btn-primary w-fit'
							onClick={handleCancelClick}>
							Cancel
						</button>
						<button
							type='button'
							className='btn btn-sm btn-primary w-fit'
							onClick={handleUpdateContentClick}>
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
						minWidth='300px'
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
							<FocusModeOverlay origin={focusOrigin}>
								{sheetArticle}
							</FocusModeOverlay>,
							document.body,
						)
					: null}
			</>
		);
	}

	return (
		<div ref={sheetRef} className='h-full'>
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
				minWidth='300px'
				maxWidth={`${FOCUS_MODE_MAX_WIDTH}px`}
				size={{
					height: '100%',
					width: pageWidth,
				}}>
				{sheetArticle}
			</Resizable>
		</div>
	);
};

export default SinglePage;

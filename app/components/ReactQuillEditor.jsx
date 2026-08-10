'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { createPortal } from 'react-dom';
import ReactQuill, { Quill } from 'react-quill-new';
import {
	HIGHLIGHT_OPTIONS,
	HIGHLIGHT_TEXT_COLOR,
	selectionHasBackground,
} from '../lib/quillHighlight';
import { setupQuillPasteSanitizer } from '../lib/quillPasteSanitizer';
import { setupQuillToolbarTooltips } from '../lib/quillToolbarTooltips';

const Size = Quill.import('attributors/style/size');
Quill.register(Size, true);

const TOOLBAR_MODULES = [
	[{ header: [1, 2, false] }],
	['bold', 'italic', 'underline'],
	[],
	[{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
	// [{ color: [] }, { background: [] }, 'clean'],
	['clean'],
	['link'],
];

const EDIT_TRANSITION_MS = 400;

const ReactQuillEditor = ({ value, onChange, readOnly = false }) => {
	const editor = useRef(null);
	const wrapperRef = useRef(null);
	const wasEditingRef = useRef(false);
	const readOnlyRef = useRef(readOnly);
	const savedRangeRef = useRef(null);
	const menuHoverRef = useRef(false);
	const hideMenuTimerRef = useRef(null);
	const lastSyncedValueRef = useRef(null);
	const [isMounted, setIsMounted] = useState(false);
	const [isToolbarExiting, setIsToolbarExiting] = useState(false);
	const [selectionMenu, setSelectionMenu] = useState(null);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	readOnlyRef.current = readOnly;

	const modules = useMemo(
		() => ({
			toolbar: TOOLBAR_MODULES,
			clipboard: {
				matchVisual: false,
			},
		}),
		[],
	);

	const cancelHideSelectionMenu = useCallback(() => {
		if (hideMenuTimerRef.current) {
			window.clearTimeout(hideMenuTimerRef.current);
			hideMenuTimerRef.current = null;
		}
	}, []);

	const hideSelectionMenu = useCallback(
		(clearSavedRange = true) => {
			cancelHideSelectionMenu();
			setSelectionMenu(null);
			if (clearSavedRange) {
				savedRangeRef.current = null;
			}
		},
		[cancelHideSelectionMenu],
	);

	const scheduleHideSelectionMenu = useCallback(() => {
		cancelHideSelectionMenu();
		hideMenuTimerRef.current = window.setTimeout(() => {
			if (!menuHoverRef.current) {
				hideSelectionMenu();
			}
		}, 200);
	}, [cancelHideSelectionMenu, hideSelectionMenu]);

	const updateSelectionMenu = useCallback(
		(quill, range) => {
			if (readOnlyRef.current) {
				hideSelectionMenu();
				return;
			}

			if (range && range.length === 0) {
				hideSelectionMenu();
				return;
			}

			if (!range) {
				if (menuHoverRef.current && savedRangeRef.current?.length) {
					return;
				}

				if (savedRangeRef.current?.length) {
					scheduleHideSelectionMenu();
					return;
				}

				hideSelectionMenu();
				return;
			}

			cancelHideSelectionMenu();

			const bounds = quill.getBounds(range.index, range.length);
			if (!bounds) {
				setSelectionMenu(null);
				return;
			}

			savedRangeRef.current = range;
			const editorRect = quill.root.getBoundingClientRect();
			setSelectionMenu({
				top: editorRect.top + bounds.top + bounds.height + 8,
				left: editorRect.left + bounds.left + bounds.width / 2,
				hasHighlight: selectionHasBackground(quill, range),
			});
		},
		[
			cancelHideSelectionMenu,
			hideSelectionMenu,
			scheduleHideSelectionMenu,
		],
	);

	const repositionSelectionMenu = useCallback(() => {
		const quill = editor.current?.getEditor?.();
		const range = savedRangeRef.current;

		if (!quill || !range || range.length === 0) {
			return;
		}

		updateSelectionMenu(quill, range);
	}, [updateSelectionMenu]);

	useEffect(() => {
		let cleanupSelection = () => {};
		let cleanupScroll = () => {};

		const initializeEditor = () => {
			const quill = editor.current?.getEditor?.();
			if (!quill) {
				return false;
			}

			quill.root.classList.add('page-sheet-prose');
			setupQuillPasteSanitizer(quill);
			setupQuillToolbarTooltips(quill);

			const handleSelectionChange = (range) => {
				updateSelectionMenu(quill, range);
			};

			quill.on('selection-change', handleSelectionChange);
			cleanupSelection = () => {
				quill.off('selection-change', handleSelectionChange);
			};

			const scrollContainers = new Set();
			const pageScroll = wrapperRef.current?.closest('.page-scroll');
			const pageListScroll = wrapperRef.current?.closest('.overflow-x-auto');

			if (pageScroll) {
				scrollContainers.add(pageScroll);
			}

			if (pageListScroll) {
				scrollContainers.add(pageListScroll);
			}

			const handleScroll = () => {
				if (savedRangeRef.current) {
					repositionSelectionMenu();
					return;
				}

				hideSelectionMenu();
			};

			scrollContainers.forEach((container) => {
				container.addEventListener('scroll', handleScroll, {
					passive: true,
				});
			});
			window.addEventListener('resize', handleScroll);

			cleanupScroll = () => {
				scrollContainers.forEach((container) => {
					container.removeEventListener('scroll', handleScroll);
				});
				window.removeEventListener('resize', handleScroll);
			};

			return true;
		};

		if (!initializeEditor()) {
			const timer = window.setTimeout(initializeEditor, 0);
			return () => {
				window.clearTimeout(timer);
				cleanupSelection();
				cleanupScroll();
			};
		}

		return () => {
			cleanupSelection();
			cleanupScroll();
			cancelHideSelectionMenu();
		};
	}, [
		cancelHideSelectionMenu,
		hideSelectionMenu,
		repositionSelectionMenu,
		updateSelectionMenu,
	]);

	useEffect(() => {
		if (readOnly) {
			hideSelectionMenu();
		}
	}, [readOnly, hideSelectionMenu]);

	useEffect(() => {
		editor.current?.getEditor()?.enable(!readOnly);
	}, [readOnly]);

	useEffect(() => {
		const quill = editor.current?.getEditor?.();
		if (!quill || value == null || !readOnly) {
			return;
		}

		if (lastSyncedValueRef.current === value) {
			return;
		}

		const currentHtml = quill.root.innerHTML;
		if (currentHtml === value) {
			lastSyncedValueRef.current = value;
			return;
		}

		quill.clipboard.dangerouslyPasteHTML(value, Quill.sources.SILENT);
		lastSyncedValueRef.current = value;
	}, [value, readOnly]);

	useEffect(() => {
		if (!readOnly) {
			wasEditingRef.current = true;
			setIsToolbarExiting(false);
			return;
		}

		if (!wasEditingRef.current) {
			return;
		}

		wasEditingRef.current = false;
		setIsToolbarExiting(true);

		const timer = window.setTimeout(() => {
			setIsToolbarExiting(false);
		}, EDIT_TRANSITION_MS);

		return () => window.clearTimeout(timer);
	}, [readOnly]);

	const getActiveRange = (quill) => {
		const currentSelection = quill.getSelection();
		if (currentSelection?.length) {
			return currentSelection;
		}

		if (savedRangeRef.current?.length) {
			return savedRangeRef.current;
		}

		const savedRange = quill.selection?.savedRange;
		if (savedRange?.length) {
			return savedRange;
		}

		return null;
	};

	const applyBackgroundFormat = (backgroundValue) => {
		const quill = editor.current?.getEditor?.();
		const range = quill ? getActiveRange(quill) : null;

		if (!quill || !range || range.length === 0) {
			return;
		}

		if (backgroundValue === false) {
			quill.formatText(
				range.index,
				range.length,
				'background',
				false,
				Quill.sources.USER,
			);
			quill.formatText(
				range.index,
				range.length,
				'color',
				false,
				Quill.sources.USER,
			);
		} else {
			quill.formatText(
				range.index,
				range.length,
				'background',
				backgroundValue,
				Quill.sources.USER,
			);
			quill.formatText(
				range.index,
				range.length,
				'color',
				HIGHLIGHT_TEXT_COLOR,
				Quill.sources.USER,
			);
		}

		quill.setSelection(range.index + range.length, 0, Quill.sources.SILENT);
		hideSelectionMenu();
	};

	const handleHighlightOption = (event, color) => {
		event.preventDefault();
		applyBackgroundFormat(color);
	};

	const handleRemoveHighlight = (event) => {
		event.preventDefault();
		applyBackgroundFormat(false);
	};

	const wrapperClassName = isToolbarExiting
		? 'quill-editor-exiting'
		: readOnly
			? 'page-sheet-view-mode'
			: 'quill-editor-enter';

	const selectionMenuPortal =
		isMounted && selectionMenu && !readOnly
			? createPortal(
					<div
						className='quill-selection-menu dropdown dropdown-hover dropdown-end'
						style={{
							top: selectionMenu.top,
							left: selectionMenu.left,
						}}
						role='toolbar'
						aria-label='Text selection actions'
						onMouseEnter={() => {
							menuHoverRef.current = true;
							cancelHideSelectionMenu();
						}}
						onMouseLeave={() => {
							menuHoverRef.current = false;
							scheduleHideSelectionMenu();
						}}>
						<div className='aura'>
							<div
								tabIndex={0}
								role='button'
								className='btn btn-neutral gap-1.5 px-4'
								onMouseDown={(event) => event.preventDefault()}>
								Highlight
								<CaretDownIcon className='size-4' />
							</div>
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content menu bg-neutral text-neutral-content rounded-box z-1001 w-44 p-2 shadow border border-neutral-content/10'
							onMouseDown={(event) => event.preventDefault()}>
							{HIGHLIGHT_OPTIONS.map((option) => (
								<li key={option.label}>
									<button
										type='button'
										className='flex items-center gap-2'
										onMouseDown={(event) =>
											handleHighlightOption(event, option.color)
										}>
										<span
											className='inline-block size-3 rounded-sm border border-neutral-content/20'
											style={{ backgroundColor: option.color }}
											aria-hidden='true'
										/>
										{option.label}
									</button>
								</li>
							))}
							{selectionMenu.hasHighlight ? (
								<li>
									<button
										type='button'
										onMouseDown={handleRemoveHighlight}>
										Remove highlight
									</button>
								</li>
							) : null}
						</ul>
					</div>,
					document.body,
				)
			: null;

	return (
		<div ref={wrapperRef} className={`relative ${wrapperClassName}`}>
			<ReactQuill
				modules={modules}
				theme='snow'
				value={value}
				onChange={onChange}
				readOnly={readOnly}
				useSemanticHTML={false}
				ref={editor}
				placeholder={readOnly ? undefined : 'Start typing content...'}
			/>
			{selectionMenuPortal}
		</div>
	);
};

export default ReactQuillEditor;

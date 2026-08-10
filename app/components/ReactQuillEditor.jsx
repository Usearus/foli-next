'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import {
	getPrimaryHighlightColor,
	selectionHasBackground,
} from '../lib/quillHighlight';
import { setupQuillPasteSanitizer } from '../lib/quillPasteSanitizer';

const Size = Quill.import('attributors/style/size');
Quill.register(Size, true);

const TOOLBAR_MODULES = [
	[{ header: [1, 2, false] }],
	['bold', 'italic', 'underline'],
	[],
	[{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
	[{ color: [] }, { background: [] }, 'clean'],
	['link'],
];

const EDIT_TRANSITION_MS = 400;

const ReactQuillEditor = ({ value, onChange, readOnly = false }) => {
	const editor = useRef(null);
	const wrapperRef = useRef(null);
	const wasEditingRef = useRef(false);
	const readOnlyRef = useRef(readOnly);
	const savedRangeRef = useRef(null);
	const [isToolbarExiting, setIsToolbarExiting] = useState(false);
	const [selectionMenu, setSelectionMenu] = useState(null);

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

	const hideSelectionMenu = useCallback(() => {
		setSelectionMenu(null);
		savedRangeRef.current = null;
	}, []);

	const updateSelectionMenu = useCallback((quill, range) => {
		if (readOnlyRef.current || !range || range.length === 0) {
			hideSelectionMenu();
			return;
		}

		const bounds = quill.getBounds(range.index, range.length);
		if (!bounds) {
			hideSelectionMenu();
			return;
		}

		savedRangeRef.current = range;
		setSelectionMenu({
			top: bounds.top + bounds.height + 8,
			left: bounds.left + bounds.width / 2,
			hasHighlight: selectionHasBackground(quill, range),
		});
	}, [hideSelectionMenu]);

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

			const handleSelectionChange = (range) => {
				updateSelectionMenu(quill, range);
			};

			quill.on('selection-change', handleSelectionChange);
			cleanupSelection = () => {
				quill.off('selection-change', handleSelectionChange);
			};

			const scrollContainer = wrapperRef.current?.closest('.page-scroll');
			const handleScroll = () => {
				hideSelectionMenu();
			};

			scrollContainer?.addEventListener('scroll', handleScroll, {
				passive: true,
			});
			cleanupScroll = () => {
				scrollContainer?.removeEventListener('scroll', handleScroll);
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
		};
	}, [hideSelectionMenu, updateSelectionMenu]);

	useEffect(() => {
		if (readOnly) {
			hideSelectionMenu();
		}
	}, [readOnly, hideSelectionMenu]);

	useEffect(() => {
		editor.current?.getEditor()?.enable(!readOnly);
	}, [readOnly]);

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

	const handleHighlightClick = (event) => {
		event.preventDefault();

		const quill = editor.current?.getEditor?.();
		const range = savedRangeRef.current;

		if (!quill || !range || range.length === 0) {
			return;
		}

		quill.formatText(
			range.index,
			range.length,
			'background',
			getPrimaryHighlightColor(),
			Quill.sources.USER,
		);
		quill.setSelection(range.index + range.length, 0, Quill.sources.SILENT);
		hideSelectionMenu();
	};

	const handleRemoveHighlightClick = (event) => {
		event.preventDefault();

		const quill = editor.current?.getEditor?.();
		const range = savedRangeRef.current;

		if (!quill || !range || range.length === 0) {
			return;
		}

		quill.formatText(
			range.index,
			range.length,
			'background',
			false,
			Quill.sources.USER,
		);
		quill.setSelection(range.index + range.length, 0, Quill.sources.SILENT);
		hideSelectionMenu();
	};

	const wrapperClassName = isToolbarExiting
		? 'quill-editor-exiting'
		: readOnly
			? 'page-sheet-view-mode'
			: 'quill-editor-enter';

	return (
		<div ref={wrapperRef} className={`relative ${wrapperClassName}`}>
			<ReactQuill
				modules={modules}
				theme='snow'
				value={value}
				onChange={onChange}
				readOnly={readOnly}
				ref={editor}
				placeholder={readOnly ? undefined : 'Start typing content...'}
			/>
			{selectionMenu && !readOnly ? (
				<div
					className='quill-selection-menu'
					style={{
						top: selectionMenu.top,
						left: selectionMenu.left,
					}}
					role='toolbar'
					aria-label='Text selection actions'>
					<button
						type='button'
						className='btn btn-ghost btn-sm'
						onMouseDown={handleHighlightClick}>
						Highlight
					</button>
					{selectionMenu.hasHighlight ? (
						<button
							type='button'
							className='btn btn-ghost btn-sm'
							onMouseDown={handleRemoveHighlightClick}>
							Remove Highlight
						</button>
					) : null}
				</div>
			) : null}
		</div>
	);
};

export default ReactQuillEditor;

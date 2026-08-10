'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
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
	const wasEditingRef = useRef(false);
	const [isToolbarExiting, setIsToolbarExiting] = useState(false);

	const modules = useMemo(
		() => ({
			toolbar: TOOLBAR_MODULES,
			clipboard: {
				matchVisual: false,
			},
		}),
		[],
	);

	useEffect(() => {
		const initializeEditor = () => {
			const quill = editor.current?.getEditor?.();
			if (!quill) {
				return false;
			}

			quill.root.classList.add('page-sheet-prose');
			setupQuillPasteSanitizer(quill);
			return true;
		};

		if (!initializeEditor()) {
			const timer = window.setTimeout(initializeEditor, 0);
			return () => window.clearTimeout(timer);
		}
	}, []);

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

	const wrapperClassName = isToolbarExiting
		? 'quill-editor-exiting'
		: readOnly
			? 'page-sheet-view-mode'
			: 'quill-editor-enter';

	return (
		<div className={wrapperClassName}>
			<ReactQuill
				modules={modules}
				theme='snow'
				value={value}
				onChange={onChange}
				readOnly={readOnly}
				ref={editor}
				placeholder={readOnly ? undefined : 'Start typing content...'}
			/>
		</div>
	);
};

export default ReactQuillEditor;

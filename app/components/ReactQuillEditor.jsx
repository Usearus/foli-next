'use client';

import { useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
const Size = Quill.import('attributors/style/size');
Quill.register(Size, true);

const ReactQuillEditor = ({ value, onChange }) => {
	const editor = useRef(null);

	const handleOnFocus = () => {
		if (editor.current) {
			const quill = editor.current.getEditor();
			quill.format('size', '16px'); // set default font size
		}
	};

	const modules = {
		toolbar: [
			[{ header: [1, 2, false] }],
			['bold', 'italic', 'underline'],
			[],
			[{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
			[{ color: [] }, { background: [] }, 'clean'],
			['link'],
		],
	};

	return (
		<div className='quill-editor-enter'>
			<ReactQuill
				modules={modules}
				theme='snow'
				value={value}
				onChange={onChange}
				ref={editor}
				onFocus={handleOnFocus}
				placeholder='Start typing content...'
			/>
		</div>
	);
};

export default ReactQuillEditor;

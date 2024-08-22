import { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Quill } from 'react-quill';

const ReactQuillEditor = ({ value, onChange }) => {
	const editor = useRef(null);

	const handleOnFocus = () => {
		if (editor.current) {
			const quill = editor.current.getEditor();
			quill.format('size', '14px'); // set default font size
		}
	};

	const fontSizeArr = [
		'8px',
		'9px',
		'10px',
		'12px',
		'14px',
		'16px',
		'20px',
		'24px',
		'32px',
		'42px',
		'54px',
		'68px',
		'84px',
		'98px',
	];

	var Size = Quill.import('attributors/style/size');
	Size.whitelist = fontSizeArr;
	Quill.register(Size, true);

	const modules = {
		toolbar: [
			// [{ 'font': Font.whitelist }],
			[{ header: [1, 2, false] }],
			[{ size: fontSizeArr }],
			['bold', 'italic', 'underline'],
			[],
			[{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
			// [{ 'indent': '-1'}, { 'indent': '+1' }],
			[{ color: [] }, { background: [] }, 'clean'],
			['link'],
		],
	};

	return (
		<>
			<ReactQuill
				modules={modules}
				theme='snow'
				value={value}
				onChange={onChange}
				ref={editor}
				onFocus={handleOnFocus}
				placeholder='Start typing content...'
			/>
		</>
	);
};

export default ReactQuillEditor;

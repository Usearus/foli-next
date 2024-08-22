import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ReactQuillContent = ({ value, onChange }) => {
	const editorRef = useRef(null);

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
		<ReactQuill
			modules={modules}
			value={value}
			onChange={onChange}
			ref={editorRef}
			placeholder='Start typing content...'
			className='quill-editor'
		/>
	);
};

export default ReactQuillContent;

// <div
// 				id='shared-toolbar'
// 				className='bg-base-100 p-2 rounded-t-lg border-b border-base-200'>
// 				{/* Add any custom toolbar buttons here */}
// 				<button className='btn btn-primary btn-sm'>Bold</button>
// 				<button className='btn btn-secondary btn-sm'>Italic</button>
// 				<button className='btn btn-accent btn-sm'>Underline</button>
// 				{/* Add more buttons as needed */}
// 			</div>

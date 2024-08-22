'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import ReactQuillEditor from './ReactQuillEditor';
import MarkdownView from 'react-showdown';
import useAlert from '../alerts/useAlert';
// import ModalDeleteConfirmation
import { DotsVerticalIcon, GearIcon, ExitIcon } from '@radix-ui/react-icons';
// import ModalEditPage
import { supabase } from '../api/supabase';
import { Resizable } from 're-resizable';

const SinglePage = (page) => {
	// Context Variables
	const { fetchCurrentPages, currentJob } = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	// Modals
	const [selectedEventKey, setSelectedEventKey] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showEditPageModal, setShowEditPageModal] = useState(false);

	const handleSelect = (eventKey) => {
		setSelectedEventKey(eventKey);
		if (eventKey === '1') {
			setShowDeleteModal(true);
			console.log('handleSelect called');
		}
	};

	const handleOpenPageModalClick = () => {
		setShowEditPageModal(true);
	};

	const handleCloseReset = () => {
		// Will close any modal opened by the dropdown
		console.log('handleCloseReset called');
		setShowDeleteModal(false);
	};

	// PAGE FUNCTIONS
	const initialVisibleValue = page.visible;
	// Check width on load and render mobile or desktop pages
	const isMobile = window.matchMedia('(max-width: 768px)').matches;

	// Resizing
	const [pageWidth, setPageWidth] = useState(page.width);
	console.log(pageWidth);

	const handleUpdateWidthClick = async (newPageWidth) => {
		console.log('Updating width to:', newPageWidth);
		setPageWidth(newPageWidth);
		const { error } = await supabase
			.from('pages')
			.update({
				width: newPageWidth,
			})
			.eq('id', page.id);
		// setAlert('Page width updated', 'success');

		if (error) {
			setAlert('Unable to update page width.', 'danger');
			console.log('error is', error);
			return;
		}
	};

	// EDITING PAGE FUNCTIONS
	const [editing, setEditing] = useState(false);
	const handleEditClick = () => {
		setEditing(true);
	};

	const handleCancelClick = () => {
		setContent(page.content);
		setEditing(false);
		setShowEditPageModal(false);
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

	// React Quill Editor Variables & Functions
	const [content, setContent] = useState(page.content);

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
			setAlert('Page updated', 'success');
			fetchCurrentPages(currentJob);
			setEditing(false);
			setShowEditPageModal(false);
			if (error) {
				setAlert('Unable to update page', 'danger');
				console.log('error is', error);
				return;
			}
		}
		if (!page.locked) {
			const { error } = await supabase
				.from('pages')
				.update({
					content: content,
					title: titleRef.current.value,
				})
				.eq('id', page.id);
			setAlert('Page updated', 'success');
			fetchCurrentPages(currentJob);
			setEditing(false);
			setShowEditPageModal(false);
			if (error) {
				setAlert('Unable to update page', 'danger');
				console.log('error is', error);
				return;
			}
		}
	};

	// Editing Title
	const initialTitleValue = page.title ?? '';
	const [title, setTitle] = useState(page.title);
	const titleRef = useRef();
	const [characterCount, setCharacterCount] = useState(title.length);
	const titleMaxChar = 32;

	const handleTitleChange = (event) => {
		const newValue = event.target.value;
		setCharacterCount(newValue.length);
	};

	if (initialVisibleValue === false) {
		return <></>;
	}

	// DESKTOP PAGE
	// if (isMobile === false) {
	return (
		<Resizable
			className={`${editing ? 'editing-content' : 'page-content'} shadow-on`}
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
			onResizeStop={(e, direction, ref, d) => {
				const newPageWidth = pageWidth + d.width;
				handleUpdateWidthClick(newPageWidth);
			}}
			minWidth='300px'
			maxWidth='700px'
			size={{
				height: '100%',
				width: pageWidth,
			}}>
			<div
				className='bg-base-100 h-full p-4 flex flex-col gap-2'
				style={{ width: pageWidth }}>
				<label className='font-bold'>{page.title}</label>
				<hr />
				<form className='mt-4 flex flex-col items-end flex-grow'>
					{editing ? (
						<div className='page-scroll'>
							<ReactQuillEditor
								value={page.content}
								onChange={handleEditorChange}
							/>
						</div>
					) : (
						<MarkdownView
							className='page-scroll markdown-content'
							markdown={page.content}
						/>
					)}
				</form>
				<button type='submit' className='btn btn-primary w-fit'>
					Submit {`"${pageWidth}px"`}
				</button>
				<div style={{ width: pageWidth }}>
					{' '}
					Width is {`"${pageWidth}px"`} {page.width}
				</div>
			</div>
		</Resizable>
	);
};
// };
export default SinglePage;

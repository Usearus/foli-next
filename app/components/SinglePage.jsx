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
		console.log('editing is now', editing);
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
			// className={`${editing ? 'editing-content' : 'page-content'} shadow-on`}
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
			<article
				className='bg-base-100 h-full p-4 flex flex-col gap-2'
				style={{ width: pageWidth }}>
				<div className='flex justify-between'>
					<label className='font-bold'>{page.title}</label>
					<div className='dropdown dropdown-end'>
						<div tabIndex={0} role='button' className='btn btn-xs btn-ghost '>
							<DotsVerticalIcon />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow'>
							<li>
								<a>Edit</a>
							</li>
							<li>
								<a>Delete</a>
							</li>
						</ul>
					</div>
				</div>
				<hr />

				{editing ? (
					// Quill version
					<div className='flex flex-col justify-between h-full'>
						<div className='page-scroll'>
							<ReactQuillEditor value={content} onChange={handleEditorChange} />
						</div>
						<div className='flex justify-end gap-2'>
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
					</div>
				) : (
					// Markdown version
					<div className='flex flex-col justify-between h-full'>
						<MarkdownView
							className='page-scroll markdown-content'
							markdown={page.content}
						/>
						<div className='flex justify-end'>
							<button
								type='button'
								className='btn btn-sm btn-outline btn-primary w-fit'
								onClick={handleEditClick}>
								Edit page
							</button>
						</div>
					</div>
				)}
			</article>
		</Resizable>
	);
};
// };
export default SinglePage;

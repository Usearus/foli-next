'use client';

import { useState, useRef, useContext } from 'react';
import { supabase } from '../api/supabase';
import { DEFAULT_USER } from '../config/user';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import TemplateSidePanel from './TemplateSidePanel';

const AddPageDropdown = () => {
	const {
		currentJob,
		currentPages,
		fetchCurrentPages,
		setSelectedPageID,
	} = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
	const [validated, setValidated] = useState(false);
	const titleRef = useRef(null);
	const titleMaxChar = 32;

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		if (form.checkValidity() === true) {
			setValidated(false);
			handleAddPageClick();
		} else {
			setValidated(true);
		}
	};

	const handleAddPageClick = async () => {
		if (currentJob) {
			const { data, error } = await supabase
				.from('pages')
				.insert({
					account: DEFAULT_USER.email,
					title: titleRef.current.value,
					jobid: currentJob.id,
					position: currentPages.length,
					isNote: false,
				})
				.select();

			if (error) {
				setAlert('Unable to add page', 'error');
				console.log(error);
				return;
			}

			setAlert('Page added', 'success');
			fetchCurrentPages(currentJob);
			const newPageId = data[0].id;
			setSelectedPageID(newPageId);
			setIsModalOpen(false);
		}
	};

	const AddPageModal = () => {
		return (
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Add page'>
				<div className='pb-4 flex flex-col gap-4'>
					<form
						className={validated ? 'was-validated' : ''}
						onSubmit={handleSubmit}
						noValidate>
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>
									Title <span className='text-primary'>*</span>
								</span>
							</div>
							<input
								type='text'
								required
								ref={titleRef}
								maxLength={titleMaxChar}
								className='input input-bordered w-full bg-base-300'
							/>
						</label>
						<div className='flex justify-end pt-6'>
							<button type='submit' className='btn btn-primary'>
								Confirm
							</button>
						</div>
					</form>
				</div>
			</Modal>
		);
	};

	return (
		<>
			<AddPageModal />
			<TemplateSidePanel
				isOpen={isTemplatePanelOpen}
				onClose={() => setIsTemplatePanelOpen(false)}
			/>
			<div className='dropdown dropdown-bottom dropdown-end'>
				<div tabIndex={0} role='button' className='btn btn-sm btn-primary m-1'>
					Add page
				</div>
				<ul
					tabIndex={0}
					className='dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow'>
					<li>
						<button type='button' onClick={() => setIsModalOpen(true)}>
							Blank page
						</button>
					</li>
					<li>
						<button type='button' onClick={() => setIsTemplatePanelOpen(true)}>
							Use template
						</button>
					</li>
					<li className='disabled'>
						<button type='button'>Use AI assistant</button>
					</li>
				</ul>
			</div>
		</>
	);
};

export default AddPageDropdown;

'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { isMasterResumeTemplate } from '../lib/masterResumeTemplate';
import {
	findCustomTemplateByTitle,
	savePageAsTemplate,
	updateCustomTemplate,
} from '../lib/savePageAsTemplate';

const TITLE_MAX_CHAR = 32;

const SaveAsTemplateBtn = ({ page, content, getDefaultTitle }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [validated, setValidated] = useState(false);
	const [step, setStep] = useState('edit');
	const [pendingTitle, setPendingTitle] = useState('');
	const [existingTemplate, setExistingTemplate] = useState(null);
	const titleRef = useRef(null);
	const { allTemplates, fetchAllTemplates } = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	useEffect(() => {
		if (!isModalOpen || !titleRef.current) {
			return;
		}

		titleRef.current.value = getDefaultTitle?.() ?? page.title ?? '';
		setValidated(false);
		setStep('edit');
		setPendingTitle('');
		setExistingTemplate(null);
	}, [isModalOpen, getDefaultTitle, page.title]);

	const handleOpen = () => {
		document.activeElement?.blur();
		setIsModalOpen(true);
	};

	const handleClose = () => {
		setIsModalOpen(false);
		setValidated(false);
		setStep('edit');
		setPendingTitle('');
		setExistingTemplate(null);
	};

	const persistTemplate = async (title, existing) => {
		const result = existing
			? await updateCustomTemplate({
					id: existing.id,
					title,
					content,
				})
			: await savePageAsTemplate({ title, content });

		if (result.error) {
			setAlert('Unable to save template.', 'error');
			console.log(result.error);
			return false;
		}

		setAlert(existing ? 'Template updated' : 'Template saved', 'success');
		await fetchAllTemplates();
		handleClose();
		return true;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		event.stopPropagation();

		const form = event.currentTarget;
		if (!form.checkValidity()) {
			setValidated(true);
			return;
		}

		const title = titleRef.current?.value.trim();
		if (!title) {
			setAlert('Template title is required.', 'warning');
			return;
		}

		const existing = findCustomTemplateByTitle(allTemplates ?? [], title);
		if (existing) {
			if (isMasterResumeTemplate(existing)) {
				setAlert('Master Resume cannot be overwritten.', 'warning');
				return;
			}

			setPendingTitle(title);
			setExistingTemplate(existing);
			setStep('confirm-override');
			return;
		}

		await persistTemplate(title, null);
	};

	const handleOverride = async () => {
		if (!existingTemplate || !pendingTitle) {
			return;
		}

		await persistTemplate(pendingTitle, existingTemplate);
	};

	const handleCancelOverride = () => {
		setStep('edit');
		setPendingTitle('');
		setExistingTemplate(null);
	};

	return (
		<>
			<button type='button' onClick={handleOpen}>
				Save as template
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={handleClose}
				title='Save as template'>
				{step === 'edit' ? (
					<form
						noValidate
						className={`flex flex-col gap-4 ${validated ? 'was-validated' : ''}`}
						onSubmit={handleSubmit}>
						<div>
							<label
								className='label'
								htmlFor={`save-template-title-${page.id}`}>
								Template title
							</label>
							<input
								id={`save-template-title-${page.id}`}
								type='text'
								className='input input-bordered w-full'
								ref={titleRef}
								maxLength={TITLE_MAX_CHAR}
								required
							/>
						</div>
						<div className='flex justify-end'>
							<button type='submit' className='btn btn-primary'>
								Save template
							</button>
						</div>
					</form>
				) : (
					<div className='flex flex-col gap-4'>
						<p>
							A custom template named{' '}
							<span className='font-bold'>{pendingTitle}</span> already exists.
							Override it with this page&apos;s content?
						</p>
						<div className='flex justify-end gap-2'>
							<button
								type='button'
								className='btn btn-ghost'
								onClick={handleCancelOverride}>
								Cancel
							</button>
							<button
								type='button'
								className='btn btn-primary'
								onClick={handleOverride}>
								Override
							</button>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
};

export default SaveAsTemplateBtn;

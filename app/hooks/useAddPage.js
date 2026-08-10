'use client';

import { useState, useRef, useContext } from 'react';
import { supabase } from '../api/supabase';
import { DEFAULT_USER } from '../config/user';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';

export function useAddPage() {
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
		if (!currentJob) {
			return;
		}

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
	};

	return {
		isModalOpen,
		setIsModalOpen,
		isTemplatePanelOpen,
		setIsTemplatePanelOpen,
		validated,
		titleRef,
		titleMaxChar,
		handleSubmit,
		openBlankPageModal: () => setIsModalOpen(true),
		openTemplatePanel: () => setIsTemplatePanelOpen(true),
	};
}

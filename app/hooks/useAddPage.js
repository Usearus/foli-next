'use client';

import { useState, useContext } from 'react';
import { supabase } from '../api/supabase';
import { DEFAULT_USER } from '../config/user';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import { PAGE_TITLE_MAX_CHAR } from '../lib/ai/pageTitle';
import { DEFAULT_PAGE_WIDTH } from '../lib/pageDefaults';

export function useAddPage() {
	const {
		currentJob,
		currentPages,
		fetchCurrentPages,
		setSelectedPageID,
		setPendingEditPageId,
		requestScrollPageListToEnd,
	} = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
	const [isAiModalOpen, setIsAiModalOpen] = useState(false);
	const titleMaxChar = PAGE_TITLE_MAX_CHAR;

	const addBlankPage = async () => {
		if (!currentJob) {
			return;
		}

		const { data, error } = await supabase
			.from('pages')
			.insert({
				account: DEFAULT_USER.email,
				title: '',
				jobid: currentJob.id,
				position: currentPages.length,
				isNote: false,
				width: DEFAULT_PAGE_WIDTH,
			})
			.select();

		if (error) {
			setAlert('Unable to add page', 'error');
			console.log(error);
			return;
		}

		const newPageId = data[0].id;
		await fetchCurrentPages(currentJob);
		setSelectedPageID(newPageId);
		setPendingEditPageId(newPageId);
		requestScrollPageListToEnd();
	};

	const handleCreateAiPage = async ({ title, content }) => {
		if (!currentJob) {
			return;
		}

		const { data, error } = await supabase
			.from('pages')
			.insert({
				account: DEFAULT_USER.email,
				title: title.slice(0, titleMaxChar),
				content,
				jobid: currentJob.id,
				position: currentPages.length,
				isNote: false,
				width: DEFAULT_PAGE_WIDTH,
			})
			.select();

		if (error) {
			setAlert('Unable to create page', 'error');
			console.log(error);
			throw error;
		}

		setAlert('Page created', 'success');
		await fetchCurrentPages(currentJob);
		if (data?.[0]?.id) {
			setSelectedPageID(data[0].id);
		}
		setIsAiModalOpen(false);
	};

	return {
		currentJob,
		isTemplatePanelOpen,
		setIsTemplatePanelOpen,
		isAiModalOpen,
		setIsAiModalOpen,
		handleCreateAiPage,
		addBlankPage,
		openTemplatePanel: () => setIsTemplatePanelOpen(true),
		openAiModal: () => setIsAiModalOpen(true),
	};
}

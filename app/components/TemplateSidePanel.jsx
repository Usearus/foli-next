'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import MarkdownView from 'react-showdown';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import useAlert from '../alerts/useAlert';
import { supabase } from '../api/supabase';
import { DEFAULT_USER } from '../config/user';
import { DatabaseContext } from '../context/DatabaseContext';
import { isMasterResumeTemplate } from '../lib/masterResumeTemplate';
import { updateCustomTemplate } from '../lib/savePageAsTemplate';
import SidePanel from './SidePanel';
import DeleteTemplateButton from './DeleteTemplateButton';
import { filterTemplatesForJobStage } from '../lib/templateStageMapping';

const ReactQuillEditor = dynamic(() => import('./ReactQuillEditor'), {
	ssr: false,
});

const TEMPLATE_TITLE_MAX_CHAR = 32;

function canEditTemplate(template) {
	return template?.category === 'Custom' && !isMasterResumeTemplate(template);
}

function TemplateCard({
	template,
	onSelect,
	showCustomBadge = false,
	onDelete,
}) {
	const canDelete = onDelete && !isMasterResumeTemplate(template);

	return (
		<div
			role='button'
			tabIndex={0}
			onClick={() => onSelect(template)}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect(template);
				}
			}}
			className='card card-sm bg-base-200/50 border border-base-300 shadow-none rounded-lg text-left transition-colors hover:bg-base-200 hover:border-base-content/15 group cursor-pointer'>
			<div className='card-body p-4 flex flex-row items-center justify-between gap-2'>
				<div className='card-title text-base gap-2 text-left flex-1 min-w-0'>
					{template.title}
					{showCustomBadge ? (
						<span className='badge badge-primary badge-sm'>Custom</span>
					) : null}
				</div>
				{canDelete ? (
					<DeleteTemplateButton template={template} onDelete={onDelete} />
				) : null}
			</div>
		</div>
	);
}

function TemplateCategoryAccordions({
	templates,
	onSelect,
	showCustomBadge = false,
	onDelete,
}) {
	const statuses = useMemo(() => {
		const counts = templates.reduce((acc, template) => {
			acc[template.status] = (acc[template.status] || 0) + 1;
			return acc;
		}, {});
		return Object.keys(counts).sort();
	}, [templates]);

	const [openStatus, setOpenStatus] = useState(null);

	useEffect(() => {
		setOpenStatus((current) => {
			if (statuses.length === 0) return null;
			if (current && statuses.includes(current)) return current;
			return statuses[0];
		});
	}, [statuses]);

	const toggleStatus = (status) => {
		setOpenStatus((current) => (current === status ? null : status));
	};

	return statuses.map((status) => {
		const count = templates.filter(
			(template) => template.status === status,
		).length;
		const isOpen = openStatus === status;

		return (
			<div
				key={status}
				className={`collapse collapse-arrow bg-base-100 border border-base-300 rounded-box${isOpen ? ' collapse-open' : ''}`}>
				<input
					type='checkbox'
					checked={isOpen}
					onChange={() => toggleStatus(status)}
					aria-label={`Toggle ${status} templates`}
				/>
				<div className='collapse-title flex items-center gap-2 pe-8 font-semibold text-base'>
					<span>{status}</span>
					<span className='badge badge-ghost badge-sm font-normal'>
						{count}
					</span>
				</div>
				<div className='collapse-content'>
					<div className='flex flex-col gap-2 pb-1'>
						{templates
							.filter((template) => template.status === status)
							.sort((a, b) => a.title.localeCompare(b.title))
							.map((template) => (
								<TemplateCard
									key={template.id}
									template={template}
									onSelect={onSelect}
									showCustomBadge={showCustomBadge}
									onDelete={onDelete}
								/>
							))}
					</div>
				</div>
			</div>
		);
	});
}

const TemplateSidePanel = ({ isOpen, onClose }) => {
	const { setAlert } = useAlert();

	const {
		allTemplates,
		fetchAllTemplates,
		previewTemplate,
		activeTemplate,
		setActiveTemplate,
		setPreviewTemplate,
		currentJob,
		fetchCurrentPages,
		currentPages,
		setSelectedPageID,
	} = useContext(DatabaseContext);

	const templates = allTemplates || [];
	const [isEditingTemplate, setIsEditingTemplate] = useState(false);
	const [editTitle, setEditTitle] = useState('');
	const [editContent, setEditContent] = useState('');

	useEffect(() => {
		if (!previewTemplate) {
			setIsEditingTemplate(false);
		}
	}, [previewTemplate]);

	const handleClose = () => {
		setActiveTemplate(null);
		setPreviewTemplate(false);
		setIsEditingTemplate(false);
		onClose();
	};

	const handleSetTemplateClick = (template) => {
		setActiveTemplate(template);
		setPreviewTemplate(true);
	};

	const handleCloseActiveTemplate = () => {
		setActiveTemplate(null);
		setPreviewTemplate(false);
		setIsEditingTemplate(false);
	};

	const handleStartEditTemplate = () => {
		if (!activeTemplate || !canEditTemplate(activeTemplate)) {
			return;
		}

		setEditTitle(activeTemplate.title ?? '');
		setEditContent(activeTemplate.content ?? '');
		setIsEditingTemplate(true);
	};

	const handleCancelEditTemplate = () => {
		setIsEditingTemplate(false);
	};

	const handleSaveTemplateEdit = async () => {
		if (!activeTemplate) {
			return;
		}

		const title = editTitle.trim();
		if (!title) {
			setAlert('Template title is required.', 'warning');
			return;
		}

		const { data, error } = await updateCustomTemplate({
			id: activeTemplate.id,
			title,
			content: editContent,
		});

		if (error) {
			setAlert('Unable to update template.', 'error');
			console.log(error);
			return;
		}

		setActiveTemplate(data);
		setIsEditingTemplate(false);
		await fetchAllTemplates();
		setAlert('Template updated', 'success');
	};

	const handleDeleteTemplate = async (template) => {
		if (isMasterResumeTemplate(template)) {
			return;
		}

		const { error } = await supabase
			.from('templates')
			.delete()
			.eq('id', template.id);

		if (error) {
			setAlert('Unable to delete template.', 'error');
			console.log(error);
			return;
		}

		setAlert('Template deleted', 'success');

		if (activeTemplate?.id === template.id) {
			setActiveTemplate(null);
			setPreviewTemplate(false);
		}

		await fetchAllTemplates();
	};

	const addPageToJob = async () => {
		if (!currentJob || !activeTemplate) return;

		const { data, error } = await supabase
			.from('pages')
			.insert({
				account: DEFAULT_USER.email,
				title: activeTemplate.title,
				content: activeTemplate.content,
				jobid: currentJob.id,
				position: currentPages.length,
			})
			.select();

		if (error) {
			setAlert('Unable to add template.', 'error');
			console.log(error);
			return;
		}

		setAlert('Template added', 'success');
		await fetchCurrentPages(currentJob);
		if (data?.[0]?.id) {
			setSelectedPageID(data[0].id);
		}
	};

	const handleAddPageClick = async () => {
		await addPageToJob();
		setActiveTemplate(null);
		setPreviewTemplate(false);
		handleClose();
	};

	const customTemplates = templates.filter(
		(template) => template.category === 'Custom',
	);
	const allBuiltInTemplates = templates.filter(
		(template) =>
			template.category !== 'Custom' && template.status !== 'Master Resume',
	);

	const jobStage = currentJob?.status;
	const stageTabLabel = jobStage
		? `Because you're ${jobStage}`
		: "Because you're here";
	const stageTemplates = useMemo(
		() => filterTemplatesForJobStage(templates, jobStage),
		[templates, jobStage],
	);

	const showEditTemplate = canEditTemplate(activeTemplate);

	return (
		<SidePanel isOpen={isOpen} onClose={handleClose} title='Templates'>
			{!previewTemplate ? (
				<div role='tablist' className='tabs tabs-border'>
					<input
						type='radio'
						name='templates'
						role='tab'
						className='tab'
						aria-label={stageTabLabel}
						defaultChecked
					/>
					<div role='tabpanel' className='tab-content pt-4'>
						{!currentJob ? (
							<p className='text-sm text-base-content/70'>
								Open a job to see templates recommended for its stage.
							</p>
						) : stageTemplates.length === 0 ? (
							<p className='text-sm text-base-content/70'>
								No templates mapped to the {jobStage} stage yet.
							</p>
						) : (
							<div className='flex flex-col gap-2'>
								<TemplateCategoryAccordions
									templates={stageTemplates}
									onSelect={handleSetTemplateClick}
								/>
							</div>
						)}
					</div>

					<input
						type='radio'
						name='templates'
						role='tab'
						className='tab'
						aria-label='All'
					/>
					<div role='tabpanel' className='tab-content pt-4'>
						<div className='flex flex-col gap-2'>
							<TemplateCategoryAccordions
								templates={allBuiltInTemplates}
								onSelect={handleSetTemplateClick}
							/>
						</div>
					</div>

					<input
						type='radio'
						name='templates'
						role='tab'
						className='tab'
						aria-label='Custom'
					/>
					<div role='tabpanel' className='tab-content pt-4'>
						{customTemplates.length === 0 ? (
							<p className='text-sm text-base-content/70'>
								No custom templates yet. Save a page as a template from its
								options menu.
							</p>
						) : (
							<div className='flex flex-col gap-2'>
								<TemplateCategoryAccordions
									templates={customTemplates}
									onSelect={handleSetTemplateClick}
									showCustomBadge
									onDelete={handleDeleteTemplate}
								/>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className='h-full flex flex-col gap-4 items-start'>
					<button
						type='button'
						className='btn btn-ghost text-secondary hover:bg-base-200'
						onClick={handleCloseActiveTemplate}>
						<ArrowLeftIcon /> Back to templates
					</button>
					<div className='p-4 bg-base-200 w-full shadow-md h-full flex flex-col min-h-0'>
						<header className='page-title shrink-0'>
							{isEditingTemplate ? (
								<label className='form-control w-full gap-2'>
									<span className='label-text font-bold'>Template title</span>
									<input
										type='text'
										className='input input-bordered w-full bg-base-100'
										value={editTitle}
										maxLength={TEMPLATE_TITLE_MAX_CHAR}
										onChange={(event) => setEditTitle(event.target.value)}
									/>
								</label>
							) : (
								<h6 className='text-base font-bold'>{activeTemplate?.title}</h6>
							)}
							<div className='divider m-0 pb-0.5' />
						</header>

						<div className='grow min-h-0 overflow-y-auto'>
							{isEditingTemplate ? (
								<div className='page-sheet-editor page-sheet-editing-mode h-full min-h-48'>
									<ReactQuillEditor
										value={editContent}
										onChange={setEditContent}
										readOnly={false}
									/>
								</div>
							) : (
								<MarkdownView
									className='markdown-content'
									markdown={activeTemplate?.content}
								/>
							)}
						</div>

						<div className='flex gap-2 justify-end mt-4 shrink-0'>
							{isEditingTemplate ? (
								<>
									<button
										type='button'
										className='btn btn-ghost btn-secondary'
										onClick={handleCancelEditTemplate}>
										Cancel
									</button>
									<button
										type='button'
										className='btn btn-primary'
										onClick={handleSaveTemplateEdit}>
										Save template
									</button>
								</>
							) : (
								<>
									{showEditTemplate ? (
										<button
											type='button'
											className='btn btn-secondary'
											onClick={handleStartEditTemplate}>
											Edit template
										</button>
									) : null}
									<button
										type='button'
										className='btn btn-primary'
										onClick={handleAddPageClick}>
										Add page
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</SidePanel>
	);
};

export default TemplateSidePanel;

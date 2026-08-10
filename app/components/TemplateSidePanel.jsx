'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import MarkdownView from 'react-showdown';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import useAlert from '../alerts/useAlert';
import { supabase } from '../api/supabase';
import { DEFAULT_USER } from '../config/user';
import { DatabaseContext } from '../context/DatabaseContext';
import { isMasterResumeTemplate } from '../lib/masterResumeTemplate';
import SidePanel from './SidePanel';
import DeleteTemplateButton from './DeleteTemplateButton';
import { filterTemplatesForJobStage } from '../lib/templateStageMapping';

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

	const handleClose = () => {
		setActiveTemplate(null);
		setPreviewTemplate(false);
		onClose();
	};

	const handleSetTemplateClick = (template) => {
		setActiveTemplate(template);
		setPreviewTemplate(true);
	};

	const handleCloseActiveTemplate = () => {
		setActiveTemplate(null);
		setPreviewTemplate(false);
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
					<div className='p-4 bg-base-200 w-full shadow-md h-full flex flex-col'>
						<header className='page-title'>
							<h6 className='text-base font-bold'>{activeTemplate?.title}</h6>
							<div className='divider m-0 pb-0.5' />
						</header>

						<MarkdownView
							className='grow overflow-y-auto markdown-content'
							markdown={activeTemplate?.content}
						/>
						<div className='flex gap-2 justify-end mt-4'>
							<button
								type='button'
								className='btn btn-primary'
								onClick={handleAddPageClick}>
								Add page
							</button>
						</div>
					</div>
				</div>
			)}
		</SidePanel>
	);
};

export default TemplateSidePanel;

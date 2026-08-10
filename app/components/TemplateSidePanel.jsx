'use client';

import { useContext } from 'react';
import MarkdownView from 'react-showdown';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import useAlert from '../alerts/useAlert';
import { supabase } from '../api/supabase';
import { DEFAULT_USER } from '../config/user';
import { DatabaseContext } from '../context/DatabaseContext';
import SidePanel from './SidePanel';

function buildTemplateCategoryList(templates, onSelect, showCustomBadge = false) {
	const categoryCounts = templates.reduce((counts, template) => {
		const status = template.status;
		counts[status] = (counts[status] || 0) + 1;
		return counts;
	}, {});

	return Object.keys(categoryCounts)
		.sort()
		.map((status, index) => {
			const count = categoryCounts[status];

			return (
				<div
					key={`${status}-${index}`}
					className='collapse collapse-arrow join-item bg-base-200 cursor-pointer'>
					<input type='radio' name='my-accordion-2' />
					<div className='collapse-title flex gap-2 items-baseline'>
						{status} <span className='text-sm'>({count})</span>
					</div>
					<div className='collapse-content flex flex-col gap-4'>
						{templates
							.filter((template) => template.status === status)
							.sort((a, b) => a.title.localeCompare(b.title))
							.map((template) => (
								<button
									type='button'
									key={template.id}
									onClick={() => onSelect(template)}
									className='card card-sm bg-base-100 w-full shadow-md rounded-lg text-left'>
									<div className='card-body'>
										<h2 className='card-title text-base'>
											{template.title}
											{showCustomBadge ? (
												<div className='badge badge-primary'>Custom</div>
											) : null}
										</h2>
										<p className='text-sm text-secondary-content'>
											{template.description}
										</p>
									</div>
								</button>
							))}
					</div>
				</div>
			);
		});
}

const TemplateSidePanel = ({ isOpen, onClose }) => {
	const { setAlert } = useAlert();

	const {
		allTemplates,
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

	const emailTemplateCategoryList = buildTemplateCategoryList(
		templates.filter((template) => template.category === 'Emails'),
		handleSetTemplateClick
	);

	const resourceTemplateCategoryList = buildTemplateCategoryList(
		templates.filter((template) => template.category === 'Resources'),
		handleSetTemplateClick
	);

	const documentTemplateCategoryList = buildTemplateCategoryList(
		templates.filter((template) => template.category === 'Documents'),
		handleSetTemplateClick
	);

	const customTemplateCategoryList = buildTemplateCategoryList(
		templates.filter((template) => template.category === 'Custom'),
		handleSetTemplateClick,
		true
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
						aria-label='Emails'
						defaultChecked
					/>
					<div role='tabpanel' className='tab-content pt-6'>
						<div className='join join-vertical w-full'>
							{emailTemplateCategoryList}
						</div>
					</div>

					<input
						type='radio'
						name='templates'
						role='tab'
						className='tab'
						aria-label='Strategies'
					/>
					<div role='tabpanel' className='tab-content pt-6'>
						<div className='join join-vertical w-full'>
							{resourceTemplateCategoryList}
						</div>
					</div>

					<input
						type='radio'
						name='templates'
						role='tab'
						className='tab'
						aria-label='Documents'
					/>
					<div role='tabpanel' className='tab-content pt-6'>
						<div className='join join-vertical w-full'>
							{documentTemplateCategoryList}
						</div>
					</div>

					<input
						type='radio'
						name='templates'
						role='tab'
						className='tab'
						aria-label='Custom'
					/>
					<div role='tabpanel' className='tab-content pt-6'>
						{customTemplateCategoryList.length === 0 ? (
							<h4 className='text-lg'>
								No custom templates created yet. Start by going to the options of
								any page and clicking &quot;save as template&quot;.
							</h4>
						) : (
							<div className='join join-vertical w-full'>
								{customTemplateCategoryList}
							</div>
						)}
					</div>
				</div>
			) : (
				<div className='h-full flex flex-col gap-4 items-start'>
					<button
						type='button'
						className='btn btn-ghost text-primary hover:bg-base-200'
						onClick={handleCloseActiveTemplate}>
						<ArrowLeftIcon /> Back to templates
					</button>
					<div className='p-4 bg-base-200 w-full shadow-md h-full flex flex-col'>
						<header className='page-title'>
							<h6 className='text-base font-bold'>{activeTemplate?.title}</h6>
							<div className='divider m-0 pb-[1px]' />
						</header>

						<MarkdownView
							className='flex-grow overflow-y-auto markdown-content'
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

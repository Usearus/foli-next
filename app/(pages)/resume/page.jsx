'use client';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DatabaseContext } from '../../context/DatabaseContext';
import ContentLoader from '../../components/ContentLoader';
import TopBarResume from '../../components/TopBarResume';
import MasterResumeSheet from '../../components/MasterResumeSheet';
import ResumeJobPanel from '../../components/ResumeJobPanel';
import {
	createMasterResumeTemplate,
	fetchMasterResumeTemplate,
} from '../../lib/masterResumeTemplate';

const RESUME_TAILOR_TRANSITION_MS = 400;

const ResumePage = () => {
	const { isProfileLoading, fetchAllTemplates, userJobs } =
		useContext(DatabaseContext);
	const [masterTemplate, setMasterTemplate] = useState(null);
	const [isTemplateLoading, setIsTemplateLoading] = useState(true);
	const [selectedJobId, setSelectedJobId] = useState(null);
	const [showJobPanel, setShowJobPanel] = useState(false);
	const [isJobPanelMounted, setIsJobPanelMounted] = useState(false);
	const [isJobPanelExiting, setIsJobPanelExiting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const openedViaTailorRef = useRef(false);
	const ensuredTemplateRef = useRef(false);

	const selectedJob = useMemo(() => {
		if (!selectedJobId) {
			return null;
		}

		return (userJobs ?? []).find((job) => job.id === selectedJobId) ?? null;
	}, [selectedJobId, userJobs]);

	useEffect(() => {
		if (isProfileLoading) {
			return;
		}

		let cancelled = false;

		const loadMasterTemplate = async () => {
			setIsTemplateLoading(true);

			let { data, error } = await fetchMasterResumeTemplate();

			if (!data && !ensuredTemplateRef.current) {
				ensuredTemplateRef.current = true;
				({ data, error } = await createMasterResumeTemplate());
			}

			if (!cancelled) {
				if (error) {
					console.error(error);
				}
				setMasterTemplate(data ?? null);
				setIsTemplateLoading(false);
			}
		};

		loadMasterTemplate();

		return () => {
			cancelled = true;
		};
	}, [isProfileLoading]);

	const handleTemplateUpdate = (template) => {
		setMasterTemplate(template);
		fetchAllTemplates?.();
	};

	const handleEditingChange = (nextEditing) => {
		setIsEditing(nextEditing);

		if (!nextEditing && openedViaTailorRef.current) {
			openedViaTailorRef.current = false;
			closeJobPanel();
		}
	};

	const openJobPanel = () => {
		setIsJobPanelExiting(false);
		setIsJobPanelMounted(true);
		setShowJobPanel(true);
	};

	const closeJobPanel = () => {
		if (!isJobPanelMounted || isJobPanelExiting) {
			return;
		}

		setShowJobPanel(false);
		setIsJobPanelExiting(true);
	};

	useEffect(() => {
		if (!isJobPanelExiting) {
			return;
		}

		const timer = window.setTimeout(() => {
			setIsJobPanelMounted(false);
			setIsJobPanelExiting(false);
		}, RESUME_TAILOR_TRANSITION_MS);

		return () => window.clearTimeout(timer);
	}, [isJobPanelExiting]);

	const handleTailorClick = () => {
		openedViaTailorRef.current = true;
		openJobPanel();
		setIsEditing(true);
	};

	const handleEditClick = () => {
		openedViaTailorRef.current = false;
		setIsEditing(true);
	};

	const isTailorLayout = showJobPanel || isJobPanelExiting;
	const isLoading = isProfileLoading || isTemplateLoading;

	return (
		<div className='flex flex-col h-full min-h-0 text-base-content'>
			<TopBarResume
				showActions={!isLoading && !isEditing}
				onTailorClick={handleTailorClick}
				onEditClick={handleEditClick}
			/>
			<div className='flex-1 min-h-0 bg-base-200 px-4 pb-4 overflow-hidden'>
				{isLoading ? (
					<div className='max-w-7xl mx-auto w-full h-full'>
						<ContentLoader />
					</div>
				) : (
					<div
						className={`resume-workspace max-w-7xl mx-auto w-full h-full min-h-0 ${
							isTailorLayout ? 'resume-workspace--tailor' : 'resume-workspace--view'
						}`}>
						<div
							className={`resume-workspace__job min-h-0 min-w-0 overflow-hidden ${
								isJobPanelMounted ? 'resume-workspace__job--mounted' : ''
							}`}>
							{isJobPanelMounted ? (
								<ResumeJobPanel
									selectedJobId={selectedJobId}
									onSelectJob={setSelectedJobId}
									isExiting={isJobPanelExiting}
								/>
							) : null}
						</div>
						<MasterResumeSheet
							template={masterTemplate}
							selectedJob={selectedJob}
							editing={isEditing}
							isTailoring={showJobPanel && isEditing}
							onEditingChange={handleEditingChange}
							onTemplateUpdate={handleTemplateUpdate}
						/>
						<div className='resume-workspace__spacer' aria-hidden='true' />
					</div>
				)}
			</div>
		</div>
	);
};

export default ResumePage;

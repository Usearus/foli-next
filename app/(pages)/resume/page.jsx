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

const ResumePage = () => {
	const { isProfileLoading, fetchAllTemplates, userJobs } =
		useContext(DatabaseContext);
	const [masterTemplate, setMasterTemplate] = useState(null);
	const [isTemplateLoading, setIsTemplateLoading] = useState(true);
	const [selectedJobId, setSelectedJobId] = useState(null);
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

	const isLoading = isProfileLoading || isTemplateLoading;

	return (
		<div className='flex flex-col h-full min-h-0 text-base-content'>
			<TopBarResume />
			<div className='flex-1 min-h-0 bg-base-200 px-4 pb-4 overflow-hidden'>
				{isLoading ? (
					<div className='max-w-7xl mx-auto w-full h-full'>
						<ContentLoader />
					</div>
				) : (
					<div className='max-w-7xl mx-auto w-full h-full min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-4'>
						<ResumeJobPanel
							selectedJobId={selectedJobId}
							onSelectJob={setSelectedJobId}
						/>
						<MasterResumeSheet
							template={masterTemplate}
							selectedJob={selectedJob}
							onTemplateUpdate={handleTemplateUpdate}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default ResumePage;

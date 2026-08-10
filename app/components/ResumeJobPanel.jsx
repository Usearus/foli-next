'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { DatabaseContext } from '../context/DatabaseContext';
import { fetchJobDescriptionContent } from '../lib/masterResumeTemplate';
import ContentLoader from './ContentLoader';

const ReactQuillEditor = dynamic(() => import('./ReactQuillEditor'), {
	ssr: false,
});

const ResumeJobPanel = ({ selectedJobId, onSelectJob, isExiting = false }) => {
	const { userJobs } = useContext(DatabaseContext);
	const [descriptionHtml, setDescriptionHtml] = useState(null);
	const [isLoadingDescription, setIsLoadingDescription] = useState(false);

	const activeJobs = useMemo(
		() =>
			(userJobs ?? []).filter(
				(job) => job.status?.toLowerCase() !== 'closed',
			),
		[userJobs],
	);

	const selectedJob = useMemo(
		() => activeJobs.find((job) => job.id === selectedJobId) ?? null,
		[activeJobs, selectedJobId],
	);

	useEffect(() => {
		if (!selectedJobId) {
			setDescriptionHtml(null);
			setIsLoadingDescription(false);
			return;
		}

		let cancelled = false;
		setIsLoadingDescription(true);

		fetchJobDescriptionContent(selectedJobId).then((content) => {
			if (!cancelled) {
				setDescriptionHtml(content);
				setIsLoadingDescription(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [selectedJobId]);

	return (
		<aside
			className={`resume-job-panel flex flex-col min-h-0 h-full w-full min-w-0 bg-base-100 shadow-sm overflow-hidden gap-2 ${
				isExiting ? 'resume-job-panel--exiting pointer-events-none' : ''
			}`}>
			<div className='shrink-0 px-6 pt-8 pb-3'>
				<span className='page-sheet-title font-bold'>Job description</span>
			</div>
			<div className='border-t border-base-content/10 mx-6' aria-hidden='true' />

			<div className='shrink-0 flex flex-col gap-2 pt-2 px-6'>
				<select
					className='select select-bordered w-full bg-base-200'
					value={selectedJobId ?? ''}
					onChange={(event) =>
						onSelectJob(event.target.value ? event.target.value : null)
					}>
					<option value=''>Select a job</option>
					{activeJobs.map((job) => (
						<option key={job.id} value={job.id}>
							{job.company} - {job.position}
						</option>
					))}
				</select>
				{selectedJob ? (
					<Link
						href={`/job/${selectedJob.id}`}
						className='link link-primary text-sm inline-block'>
						Open job workspace
					</Link>
				) : null}
			</div>

			<div className='flex-1 min-h-0 flex flex-col pt-2 min-w-0'>
				{!selectedJobId ? (
					<p className='text-sm text-base-content/60 px-6'>
						Select a job to view its description while you tailor your resume.
					</p>
				) : isLoadingDescription ? (
					<ContentLoader className='p-4' />
				) : descriptionHtml !== null ? (
					<div className='page-sheet-container bg-transparent shadow-none p-0 min-h-0 h-full flex flex-col'>
						<div className='page-scroll flex-1 min-h-0'>
							<div className='page-sheet-editor page-sheet-view-mode'>
								<ReactQuillEditor
									value={descriptionHtml}
									onChange={() => {}}
									readOnly
								/>
							</div>
						</div>
					</div>
				) : (
					<p className='text-sm text-base-content/60 px-6'>
						This job does not have a Job Description page yet. Add one from the{' '}
						<Link href={`/job/${selectedJobId}`} className='link link-primary'>
							job workspace
						</Link>
						.
					</p>
				)}
			</div>
		</aside>
	);
};

export default ResumeJobPanel;

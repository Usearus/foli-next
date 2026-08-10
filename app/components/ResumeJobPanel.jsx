'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DatabaseContext } from '../context/DatabaseContext';
import { fetchJobDescriptionContent } from '../lib/masterResumeTemplate';
import ContentLoader from './ContentLoader';

const ResumeJobPanel = ({ selectedJobId, onSelectJob }) => {
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
		<aside className='flex flex-col min-h-0 h-full bg-base-100 rounded-lg shadow-sm overflow-hidden'>
			<div className='p-4 border-b border-base-content/10 shrink-0'>
				<label className='label px-0 pt-0 pb-2'>
					<span className='label-text font-semibold'>Job description</span>
				</label>
				<select
					className='select select-bordered w-full bg-base-200'
					value={selectedJobId ?? ''}
					onChange={(event) =>
						onSelectJob(event.target.value ? event.target.value : null)
					}>
					<option value=''>Select a job</option>
					{activeJobs.map((job) => (
						<option key={job.id} value={job.id}>
							{job.company} — {job.position}
						</option>
					))}
				</select>
				{selectedJob ? (
					<Link
						href={`/job/${selectedJob.id}`}
						className='link link-primary text-sm mt-2 inline-block'>
						Open job workspace
					</Link>
				) : null}
			</div>

			<div className='flex-1 min-h-0 overflow-y-auto p-4'>
				{!selectedJobId ? (
					<p className='text-sm text-base-content/60'>
						Choose a job to reference its description while editing your
						resume.
					</p>
				) : isLoadingDescription ? (
					<ContentLoader className='p-4' />
				) : descriptionHtml ? (
					<div
						className='page-sheet-prose ql-editor'
						dangerouslySetInnerHTML={{ __html: descriptionHtml }}
					/>
				) : (
					<p className='text-sm text-base-content/60'>
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

/** Maps job pipeline status → template.status values relevant at that stage. */
export const JOB_STATUS_TO_TEMPLATE_STATUSES = {
	Interested: ['Researching'],
	Applied: ['Applying', 'Resume / Cover letter'],
	Interviewing: ['Interviewing', 'Interview Prep'],
	Negotiating: ['Negotiating'],
	Accepted: ['Negotiating'],
	Declined: ['Interviewing'],
	Rejected: [],
	Closed: [],
};

export function getTemplateStatusesForJobStage(jobStatus) {
	return JOB_STATUS_TO_TEMPLATE_STATUSES[jobStatus] ?? [];
}

export function filterTemplatesForJobStage(templates, jobStatus) {
	const statuses = getTemplateStatusesForJobStage(jobStatus);
	if (statuses.length === 0) return [];

	return templates.filter(
		(template) =>
			statuses.includes(template.status) &&
			template.category !== 'Custom' &&
			template.status !== 'Master Resume',
	);
}

export const JOB_STATUSES = [
	'Interested',
	'Applied',
	'Interviewing',
	'Negotiating',
	'Accepted',
	'Declined',
	'Rejected',
	'Closed',
];

export const JOB_STATUS_STEPS = JOB_STATUSES.filter(
	(status) => status !== 'Declined' && status !== 'Rejected' && status !== 'Closed',
);

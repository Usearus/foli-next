import { JOB_STATUS_STEPS } from './jobStatuses';

const RESPONSE_STATUSES = new Set([
	'Interviewing',
	'Negotiating',
	'Accepted',
	'Rejected',
]);

export const JOB_DASHBOARD_FILTER = {
	OPEN: 'open',
	CLOSED: 'closed',
};

export function filterJobsByDashboardStatus(openJobs, closedJobs, filter) {
	if (filter === JOB_DASHBOARD_FILTER.CLOSED) {
		return closedJobs;
	}

	if (filter === JOB_DASHBOARD_FILTER.OPEN) {
		return openJobs;
	}

	return openJobs.filter((job) => job.status === filter);
}

export function computeJobStats(openJobs = [], closedJobs = []) {
	const openTotal = openJobs.length;
	const closedTotal = closedJobs.length;

	const byStatus = Object.fromEntries(
		JOB_STATUS_STEPS.map((status) => [
			status,
			openJobs.filter((job) => job.status === status).length,
		]),
	);

	const interviews = byStatus.Interviewing ?? 0;
	const responses = openJobs.filter((job) =>
		RESPONSE_STATUSES.has(job.status),
	).length;

	const responseRate =
		openTotal > 0 ? Math.round((responses / openTotal) * 100) : 0;
	const interviewRate =
		openTotal > 0 ? Math.round((interviews / openTotal) * 100) : 0;

	return {
		openTotal,
		closedTotal,
		byStatus,
		responses,
		responseRate,
		interviews,
		interviewRate,
	};
}

export function getDashboardFilterCards(stats) {
	return [
		{
			id: JOB_DASHBOARD_FILTER.OPEN,
			label: 'Open applications',
			value: stats.openTotal,
		},
		...JOB_STATUS_STEPS.map((status) => ({
			id: status,
			label: status,
			value: stats.byStatus[status] ?? 0,
		})),
		{
			id: JOB_DASHBOARD_FILTER.CLOSED,
			label: 'Closed',
			value: stats.closedTotal,
		},
	];
}

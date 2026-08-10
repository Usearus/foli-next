export function parseJobRouteId(id) {
	if (typeof id !== 'string') return '';
	return id.startsWith('id:') ? id.slice(3) : id;
}

export function getJobPath(jobId) {
	return `/job/${jobId}`;
}

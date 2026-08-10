import { JOB_STATUSES } from './jobStatuses';

const STATUS_ORDER = Object.fromEntries(
	JOB_STATUSES.map((status, index) => [status, index]),
);

const getSalaryMax = (job) => {
	const max = job?.salary_max;
	if (max === null || max === undefined || max === 0) return null;
	return max;
};

const compareJob = (a, b) => {
	const byCompany = (a.company || '').localeCompare(b.company || '', undefined, {
		sensitivity: 'base',
	});
	if (byCompany !== 0) return byCompany;

	return (a.position || '').localeCompare(b.position || '', undefined, {
		sensitivity: 'base',
	});
};

const compareSalaryMax = (a, b) => {
	const aMax = getSalaryMax(a);
	const bMax = getSalaryMax(b);

	if (aMax === null && bMax === null) return 0;
	if (aMax === null) return 1;
	if (bMax === null) return -1;

	return aMax - bMax;
};

const compareStatus = (a, b) => {
	const aOrder = STATUS_ORDER[a.status] ?? JOB_STATUSES.length;
	const bOrder = STATUS_ORDER[b.status] ?? JOB_STATUSES.length;
	return aOrder - bOrder;
};

const compareLocationRemoteFirst = (a, b) => {
	if (Boolean(a.remote) !== Boolean(b.remote)) {
		return a.remote ? -1 : 1;
	}

	const aLocation = a.location || '';
	const bLocation = b.location || '';

	if (!aLocation && !bLocation) return 0;
	if (!aLocation) return 1;
	if (!bLocation) return -1;

	return aLocation.localeCompare(bLocation, undefined, { sensitivity: 'base' });
};

const compareLocationCityFirst = (a, b) => {
	const aLocation = a.location || '';
	const bLocation = b.location || '';

	if (!aLocation && !bLocation) {
		if (Boolean(a.remote) !== Boolean(b.remote)) {
			return a.remote ? -1 : 1;
		}
		return 0;
	}
	if (!aLocation) return 1;
	if (!bLocation) return -1;

	const byCity = aLocation.localeCompare(bLocation, undefined, {
		sensitivity: 'base',
	});
	if (byCity !== 0) return byCity;

	if (Boolean(a.remote) !== Boolean(b.remote)) {
		return a.remote ? -1 : 1;
	}

	return 0;
};

const comparators = {
	job: compareJob,
	salary: compareSalaryMax,
	status: compareStatus,
};

export const sortJobs = (jobs, column, direction) => {
	if (!column || !direction) {
		return jobs;
	}

	if (column === 'location') {
		const compare =
			direction === 'asc' ? compareLocationRemoteFirst : compareLocationCityFirst;
		return [...jobs].sort(compare);
	}

	if (!comparators[column]) {
		return jobs;
	}

	const compare = comparators[column];
	const multiplier = direction === 'asc' ? 1 : -1;

	return [...jobs].sort((a, b) => compare(a, b) * multiplier);
};

export const getNextSortState = (currentColumn, currentDirection, clickedColumn) => {
	if (currentColumn !== clickedColumn) {
		return { column: clickedColumn, direction: 'asc' };
	}

	if (currentDirection === 'asc') {
		return { column: clickedColumn, direction: 'desc' };
	}

	if (currentDirection === 'desc') {
		return { column: null, direction: null };
	}

	return { column: clickedColumn, direction: 'asc' };
};

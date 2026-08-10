export const mainNavItems = [
	{
		href: '/',
		label: 'Tracker',
		id: 'jobs',
		match: (pathname) => pathname === '/',
	},
	{
		href: '/resume',
		label: 'Resume',
		id: 'resume',
		match: (pathname) => pathname.startsWith('/resume'),
	},
	{
		href: '/practice',
		label: 'Practice',
		id: 'practice',
		match: (pathname) => pathname.startsWith('/practice'),
	},
	{
		href: '/my-questions',
		label: 'My questions',
		id: 'my-questions',
		match: (pathname) => pathname.startsWith('/my-questions'),
	},
];

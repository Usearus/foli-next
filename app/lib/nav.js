export const mainNavItems = [
	{
		href: '/',
		label: 'Jobs',
		id: 'jobs',
		match: (pathname) => pathname === '/',
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

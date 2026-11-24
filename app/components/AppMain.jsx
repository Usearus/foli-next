'use client';

import { usePathname } from 'next/navigation';

const AppMain = ({ children }) => {
	const pathname = usePathname();
	const isJobPage = pathname.startsWith('/job/');

	return (
		<div
			className={`grow min-h-0 overflow-y-auto ${
				isJobPage
					? 'pb-0 md:pb-0'
					: 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'
			}`}>
			{children}
		</div>
	);
};

export default AppMain;

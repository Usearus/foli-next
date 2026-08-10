'use client';
import { useContext, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { DatabaseContext } from '../../../context/DatabaseContext';
import { useFocusMode } from '../../../context/FocusModeContext';
import { parseJobRouteId } from '../../../lib/jobRoute';
import SideBar from '../../../components/SideBar';
import TopBarJobDesktop from '../../../components/TopBarJobDesktop';
import AddPageFab from '../../../components/AddPageFab';
import PageList from '../../../components/PageList';
import Loader from '../../../components/Loader';

const JobPage = () => {
	const { id } = useParams();
	const routeJobId = parseJobRouteId(id);
	const {
		currentPages,
		currentJob,
		isJobLoading,
		openJob,
		userJobs,
		userJobsClosed,
	} = useContext(DatabaseContext);
	const { focusPageId } = useFocusMode();
	const openJobRef = useRef(openJob);

	openJobRef.current = openJob;

	useEffect(() => {
		if (!routeJobId || isJobLoading) return;
		if (String(currentJob?.id) === String(routeJobId)) return;

		const jobFromList = [...(userJobs ?? []), ...(userJobsClosed ?? [])].find(
			(job) => String(job.id) === String(routeJobId),
		);

		openJobRef.current(jobFromList ?? { id: routeJobId });
	}, [routeJobId, currentJob?.id, isJobLoading, userJobs, userJobsClosed]);

	const isJobReady =
		Boolean(routeJobId) &&
		!isJobLoading &&
		currentJob?.id &&
		String(currentJob.id) === String(routeJobId);

	if (!isJobReady) {
		return (
			<div className='flex justify-center items-center h-full'>
				<Loader />
			</div>
		);
	}

	const focusedPage = focusPageId
		? currentPages.find((page) => page.id === focusPageId)
		: null;

	if (currentPages.length > 0) {
		return (
			<div
				className={`flex flex-col h-full min-h-0 text-base-content ${
					focusedPage ? 'invisible h-0 overflow-hidden pointer-events-none' : ''
				}`}
				aria-hidden={focusedPage ? true : undefined}>
				<div className='flex-1 min-h-0 grid grid-rows-[auto_1fr] grid-cols-1 lg:grid-cols-[250px_auto]'>
					<TopBarJobDesktop />

					<div className='hidden lg:flex flex-col row-span-1 bg-base-200 pt-4 min-h-0 overflow-y-auto'>
						<SideBar />
					</div>

					<div className='row-span-1 col-span-1 bg-base-200 p-4 overflow-hidden min-h-0'>
						<PageList />
					</div>
				</div>
				<AddPageFab />
			</div>
		);
	}

	if (currentPages.length === 0) {
		return (
			<div className='flex flex-col h-full min-h-0 text-base-content'>
				<div className='flex-1 min-h-0 grid grid-rows-[auto_1fr] grid-cols-1'>
					<TopBarJobDesktop />
					<div className='row-span-1 col-span-1 bg-base-200 p-4 flex justify-center items-center'>
						<h2 className='text-lg font-bold'>
							No pages added yet. Add your first page to get started.
						</h2>
					</div>
				</div>
				<AddPageFab />
			</div>
		);
	}
};

export default JobPage;

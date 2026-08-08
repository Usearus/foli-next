'use client';
import { useContext, useState, useEffect } from 'react';
import { DatabaseContext } from '../../../context/DatabaseContext';
import { useFocusMode } from '../../../context/FocusModeContext';
import SideBar from '../../../components/SideBar';
import TopBarJobDesktop from '../../../components/TopBarJobDesktop';
import PageList from '../../../components/PageList';
import Loader from '../../../components/Loader';

const JobPage = () => {
	const { currentPages } = useContext(DatabaseContext);
	const { focusPageId } = useFocusMode();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (currentPages) {
			setIsLoading(false);
		}
	}, [currentPages]);

	if (isLoading) {
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
				className={`flex flex-col h-full text-base-content ${
					focusedPage ? 'invisible h-0 overflow-hidden pointer-events-none' : ''
				}`}
				aria-hidden={focusedPage ? true : undefined}>
				<div className='flex-grow grid grid-rows-[70px_auto] grid-cols-1 lg:grid-cols-[250px_auto]'>
					<TopBarJobDesktop />

					<div className='hidden lg:flex flex-col row-span-1 bg-base-200 pt-4'>
						<SideBar />
					</div>

					<div className='row-span-1 col-span-1 bg-base-200 p-4 overflow-hidden'>
						<PageList />
					</div>
				</div>
			</div>
		);
	}

	if (currentPages.length === 0) {
		return (
			<div className='flex flex-col h-full text-base-content'>
				<div className='flex-grow grid grid-rows-[70px_auto] grid-cols-1'>
					<TopBarJobDesktop />
					<div className='row-span-1 col-span-1 bg-base-200 p-4 flex justify-center items-center'>
						<h2 className='text-lg font-bold'>
							No pages added yet. Add your first page to get started.
						</h2>
					</div>
				</div>
			</div>
		);
	}
};

export default JobPage;

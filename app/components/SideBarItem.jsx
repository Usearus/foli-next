'use client';
import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import { supabase } from '../api/supabase';
import DeletePageIcon from './DeletePageIcon';

const SideBarItem = ({ page, setShowOffcanvas, showOffcanvas }) => {
	const { fetchCurrentPages, currentJob, setSelectedPageID } =
		useContext(DatabaseContext);

	const handleVisibilityClick = async () => {
		const visible = page.visible;
		await supabase
			.from('pages')
			.update({
				visible: !visible,
			})
			.eq('id', page.id);
		fetchCurrentPages(currentJob);
	};

	const handleSideBarItemClick = () => {
		setSelectedPageID(page.id);
		if (showOffcanvas === true) {
			setShowOffcanvas(false);
		}
	};

	return (
		<ul className='menu bg-base-200 rounded-lg w-full py-0'>
			{/* Add the 'group' class */}
			<li className='w-full group'>
				<div className='flex justify-between items-center pr-1 w-full'>
					<p
						onClick={handleSideBarItemClick}
						className='max-w-[75%] text-base whitespace-nowrap overflow-hidden text-ellipsis'>
						{page.title}
					</p>
					<div className='flex gap-1'>
						{page.locked ? null : <DeletePageIcon page={page} />}
						<div
							role='button'
							onClick={handleVisibilityClick}
							className='btn btn-ghost btn-sm btn-square'>
							{page.visible ? (
								<EyeOpenIcon className='size-3.5' />
							) : (
								<EyeClosedIcon className='size-3.5' />
							)}
						</div>
					</div>
				</div>
			</li>
		</ul>
	);
};

export default SideBarItem;

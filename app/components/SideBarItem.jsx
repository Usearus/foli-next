'use client';
import { useContext, useState } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { EyeOpenIcon, EyeClosedIcon, TrashIcon } from '@radix-ui/react-icons';
import { supabase } from '../api/supabase';

const SideBarItem = ({ page, setShowOffcanvas, showOffcanvas }) => {
	const { fetchCurrentPages, currentJob, setSelectedPageID } =
		useContext(DatabaseContext);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

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

	// Will close any modal opened by the dropdown
	// const handleCloseModal = () => {
	// 	setShowDeleteModal(false);
	// };

	// Will handle any modal option selected
	// const handleDeleteModal = () => {
	// 	setShowDeleteModal(true);
	// };

	// Will scroll screen to that item
	const handleSideBarItemClick = () => {
		setSelectedPageID(page.id);
		if (showOffcanvas === true) {
			setShowOffcanvas(false);
		}
	};

	return (
		<ul className='py-0 menu menu-sm bg-base-200 rounded-lg w-full'>
			{/* Add the 'group' class */}
			<li className='w-full group'>
				<div className='flex justify-between items-center pr-1 w-full'>
					<p
						onClick={handleSideBarItemClick}
						className='max-w-[75%] whitespace-nowrap overflow-hidden text-ellipsis'>
						{page.title}
					</p>
					<div className='flex gap-1'>
						<div
							role='button'
							className='btn btn-xs hidden group-hover:flex transition-opacity duration-200'>
							<TrashIcon />
						</div>
						<div
							role='button'
							onClick={handleVisibilityClick}
							className='btn btn-xs'>
							{page.visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
						</div>
					</div>
				</div>
			</li>
		</ul>
	);
};

export default SideBarItem;

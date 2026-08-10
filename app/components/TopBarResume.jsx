'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const TopBarResume = ({ onTailorClick, onEditClick, showActions = true }) => {
	return (
		<div className='p-4 z-10 shrink-0'>
			<div className='max-w-7xl mx-auto w-full flex items-center justify-between gap-4 min-h-12'>
				<div className='flex gap-2 items-center min-w-0'>
					<Link href='/' className='btn btn-ghost md:hidden shrink-0'>
						<ArrowLeftIcon />
					</Link>
					<div className='min-w-0'>
						<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis'>
							Resume
						</p>
					</div>
				</div>
				<div
					className={`flex shrink-0 flex-nowrap items-center justify-end gap-2 min-h-12 ${
						showActions ? '' : 'invisible pointer-events-none'
					}`}
					aria-hidden={!showActions}>
					<button
						type='button'
						className='btn btn-outline btn-md'
						onClick={onTailorClick}
						tabIndex={showActions ? 0 : -1}>
						Tailor resume for job
					</button>
					<button
						type='button'
						className='btn btn-primary btn-md'
						onClick={onEditClick}
						tabIndex={showActions ? 0 : -1}>
						Edit master resume
					</button>
				</div>
			</div>
		</div>
	);
};

export default TopBarResume;

'use client';

import Link from 'next/link';
import AddEmployerQuestionBtn from './AddEmployerQuestionBtn';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const TopBarMyQuestions = ({ selectedCount, onCopySelected, onClearSelection }) => {
	return (
		<div className='p-4 flex items-center justify-between gap-4 z-10'>
			<div className='flex gap-2 items-center min-w-0'>
				<Link href='/' className='btn btn-ghost btn-sm md:hidden shrink-0'>
					<ArrowLeftIcon />
				</Link>
				<div className='min-w-0'>
					<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis pt-1'>
						My questions
					</p>
					<p className='text-sm hidden md:block'>
						Questions to ask the employer — check items and copy into a job page.
					</p>
				</div>
			</div>
			<div className='flex items-center gap-2 shrink-0'>
				{selectedCount > 0 ? (
					<>
						<button
							type='button'
							className='btn btn-ghost btn-sm hidden sm:inline-flex'
							onClick={onClearSelection}>
							Clear
						</button>
						<button
							type='button'
							className='btn btn-outline btn-primary btn-sm'
							onClick={onCopySelected}>
							Copy {selectedCount}
						</button>
					</>
				) : null}
				<AddEmployerQuestionBtn />
			</div>
		</div>
	);
};

export default TopBarMyQuestions;

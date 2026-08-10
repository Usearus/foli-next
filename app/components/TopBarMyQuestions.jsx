'use client';

import Link from 'next/link';
import AddEmployerQuestionBtn from './AddEmployerQuestionBtn';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const TopBarMyQuestions = ({ selectedCount, onCopySelected, onClearSelection }) => {
	return (
		<div className='p-4 z-10'>
			<div className='max-w-7xl mx-auto w-full flex items-center justify-between gap-4'>
				<div className='flex gap-2 items-center min-w-0'>
					<Link href='/' className='btn btn-ghost md:hidden shrink-0'>
						<ArrowLeftIcon />
					</Link>
					<div className='min-w-0'>
						<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis'>
							My questions
						</p>
					</div>
				</div>
				<div className='flex items-center gap-2 shrink-0'>
					{selectedCount > 0 ? (
						<>
							<button
								type='button'
								className='btn btn-ghost hidden sm:inline-flex'
								onClick={onClearSelection}>
								Clear
							</button>
							<button
								type='button'
								className='btn btn-outline btn-secondary'
								onClick={onCopySelected}>
								Copy {selectedCount}
							</button>
						</>
					) : null}
					<AddEmployerQuestionBtn />
				</div>
			</div>
		</div>
	);
};

export default TopBarMyQuestions;

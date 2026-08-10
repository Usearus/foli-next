'use client';

import Link from 'next/link';
import AddQuestionBtn from './AddQuestionBtn';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const TopBarQuestions = () => {
	return (
		<div className='p-4 z-10'>
			<div className='max-w-7xl mx-auto w-full flex items-center justify-between'>
				<div className='flex gap-2 items-center'>
					<Link href='/' className='btn btn-ghost md:hidden'>
						<ArrowLeftIcon />
					</Link>
					<div>
						<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis'>
							Practice
						</p>
					</div>
				</div>
				<AddQuestionBtn />
			</div>
		</div>
	);
};

export default TopBarQuestions;

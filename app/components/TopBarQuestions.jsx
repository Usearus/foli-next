'use client';

import Link from 'next/link';
import AddQuestionBtn from './AddQuestionBtn';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const TopBarQuestions = () => {
	return (
		<div className='p-4 flex items-center justify-between z-10'>
			<div className='flex gap-2 items-center'>
				<Link href='/' className='btn btn-ghost btn-sm md:hidden'>
					<ArrowLeftIcon />
				</Link>
				<div>
					<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis pt-1'>
						Practice
					</p>
					<p className='text-sm hidden md:block'>
						Practice answering questions interviewers may ask you.
					</p>
				</div>
			</div>
			<AddQuestionBtn />
		</div>
	);
};

export default TopBarQuestions;

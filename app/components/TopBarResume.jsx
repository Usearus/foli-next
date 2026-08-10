'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

const TopBarResume = () => {
	return (
		<div className='p-4 z-10'>
			<div className='max-w-7xl mx-auto w-full flex items-center justify-between'>
				<div className='flex gap-2 items-center min-w-0'>
					<Link href='/' className='btn btn-ghost md:hidden shrink-0'>
						<ArrowLeftIcon />
					</Link>
					<div className='min-w-0'>
						<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis'>
							Resume
						</p>
						<p className='text-sm text-base-content/60 hidden sm:block'>
							Edit your master template — reference a job description on the
							left
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopBarResume;

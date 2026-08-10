'use client';

import AddJobBtn from './AddJobBtn';

const TopBarJobs = () => {
	return (
		<div className='p-4 z-10'>
			<div className='max-w-7xl mx-auto w-full flex items-center justify-between'>
				<div>
					<p className='text-base md:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis'>
						Application tracker
					</p>
				</div>
				<AddJobBtn />
			</div>
		</div>
	);
};

export default TopBarJobs;

'use client';

const QuestionSearchInput = ({
	value,
	onChange,
	placeholder = 'Search questions',
	className = '',
}) => {
	return (
		<label className={`input bg-base-200 w-full ${className}`.trim()}>
			<svg
				className='h-[1em] opacity-50 shrink-0'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 24 24'
				aria-hidden='true'>
				<g
					strokeLinejoin='round'
					strokeLinecap='round'
					strokeWidth='2.5'
					fill='none'
					stroke='currentColor'>
					<circle cx='11' cy='11' r='8'></circle>
					<path d='m21 21-4.3-4.3'></path>
				</g>
			</svg>
			<input
				type='search'
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className='grow'
				aria-label={placeholder}
			/>
		</label>
	);
};

export default QuestionSearchInput;

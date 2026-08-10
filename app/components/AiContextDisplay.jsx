'use client';

import { useEffect, useRef, useState } from 'react';

const AI_CONTEXT_PREVIEW_MAX_HEIGHT = 400;

const AiContextDisplay = ({ content, placeholder }) => {
	const contentRef = useRef(null);
	const [isOverflowing, setIsOverflowing] = useState(false);

	const hasContent = Boolean(content?.trim());
	const displayText = hasContent ? content : placeholder;

	useEffect(() => {
		const element = contentRef.current;
		if (!element) return;

		const checkOverflow = () => {
			setIsOverflowing(element.scrollHeight > element.clientHeight);
		};

		checkOverflow();

		const observer = new ResizeObserver(checkOverflow);
		observer.observe(element);

		return () => observer.disconnect();
	}, [displayText]);

	return (
		<div className='relative'>
			<div
				ref={contentRef}
				className={`overflow-hidden whitespace-pre-wrap text-sm leading-relaxed${
					hasContent ? '' : ' text-base-content/50'
				}`}
				style={{ maxHeight: AI_CONTEXT_PREVIEW_MAX_HEIGHT }}>
				{displayText}
			</div>
			{isOverflowing ? (
				<div
					className='pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-base-100 to-transparent'
					aria-hidden='true'
				/>
			) : null}
		</div>
	);
};

export default AiContextDisplay;

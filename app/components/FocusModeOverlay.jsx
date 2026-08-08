'use client';

import { useEffect, useMemo, useState } from 'react';

const FOCUS_ANIMATION_MS = 450;
const FOCUS_MAX_WIDTH = 700;

const FocusModeOverlay = ({ origin, children }) => {
	const [isAnimatingIn, setIsAnimatingIn] = useState(true);

	const initialTransform = useMemo(() => {
		if (!origin || typeof window === 'undefined') {
			return 'none';
		}

		const targetWidth = Math.min(FOCUS_MAX_WIDTH, window.innerWidth - 32);
		const topPadding = 32;
		const bottomPadding = 16;
		const targetHeight = window.innerHeight - topPadding - bottomPadding;
		const targetCenterX = window.innerWidth / 2;
		const targetCenterY = topPadding + targetHeight / 2;
		const originCenterX = origin.left + origin.width / 2;
		const originCenterY = origin.top + origin.height / 2;
		const scale = Math.min(origin.width / targetWidth, origin.height / targetHeight, 1);

		return `translate(${originCenterX - targetCenterX}px, ${originCenterY - targetCenterY}px) scale(${scale})`;
	}, [origin]);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setIsAnimatingIn(false);
		});

		return () => cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	return (
		<div className='focus-mode-overlay fixed inset-0 z-[100] bg-base-200 pt-8 pb-4 px-4 flex items-center justify-center'>
			<div
				className='focus-mode-panel h-[calc(100vh-5rem)] w-full max-w-[700px]'
				style={{
					transform: isAnimatingIn ? initialTransform : 'none',
					transition: `transform ${FOCUS_ANIMATION_MS}ms ease-out`,
				}}>
				{children}
			</div>
		</div>
	);
};

export default FocusModeOverlay;

'use client';

import { useEffect, useMemo, useState } from 'react';

export const FOCUS_ANIMATION_MS = 450;
const FOCUS_MAX_WIDTH = 700;

const FocusModeOverlay = ({ origin, children, isExiting = false, onExitComplete }) => {
	const [isAnimatingIn, setIsAnimatingIn] = useState(true);
	const [isAnimatingOut, setIsAnimatingOut] = useState(false);

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
		const scale = Math.min(
			origin.width / targetWidth,
			origin.height / targetHeight,
			1,
		);

		return `translate(${originCenterX - targetCenterX}px, ${originCenterY - targetCenterY}px) scale(${scale})`;
	}, [origin]);

	const hasTransformExit = initialTransform !== 'none';

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setIsAnimatingIn(false);
		});

		return () => cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		if (!isExiting) {
			return;
		}

		setIsAnimatingOut(true);
	}, [isExiting]);

	useEffect(() => {
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	const handlePanelTransitionEnd = (event) => {
		if (!isAnimatingOut || event.propertyName !== 'transform') {
			return;
		}

		if (hasTransformExit) {
			onExitComplete?.();
		}
	};

	const handleOverlayTransitionEnd = (event) => {
		if (!isAnimatingOut || event.propertyName !== 'opacity') {
			return;
		}

		if (!hasTransformExit) {
			onExitComplete?.();
		}
	};

	const panelTransform =
		isAnimatingIn || isAnimatingOut ? initialTransform : 'none';

	return (
		<div
			className='focus-mode-overlay fixed inset-0 z-[100] bg-base-200 pt-8 pb-4 px-4 flex items-center justify-center'
			style={{
				opacity: isAnimatingOut ? 0 : 1,
				transition: `opacity ${FOCUS_ANIMATION_MS}ms ease-out`,
			}}
			onTransitionEnd={handleOverlayTransitionEnd}>
			<div
				className='focus-mode-panel flex flex-col h-[calc(100vh-5rem)] w-full max-w-[700px]'
				style={{
					transform: panelTransform,
					transition: `transform ${FOCUS_ANIMATION_MS}ms ease-out`,
				}}
				onTransitionEnd={handlePanelTransitionEnd}>
				{children}
			</div>
		</div>
	);
};

export default FocusModeOverlay;

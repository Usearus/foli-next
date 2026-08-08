'use client';

import { useEffect, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';

export const StrictModeDroppable = ({
	children,
	isDropDisabled = false,
	isCombineEnabled = false,
	ignoreContainerClipping = false,
	...props
}) => {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const animation = requestAnimationFrame(() => setEnabled(true));
		return () => {
			cancelAnimationFrame(animation);
			setEnabled(false);
		};
	}, []);

	if (!enabled) {
		return null;
	}

	return (
		<Droppable
			{...props}
			isDropDisabled={isDropDisabled}
			isCombineEnabled={isCombineEnabled}
			ignoreContainerClipping={ignoreContainerClipping}>
			{children}
		</Droppable>
	);
};

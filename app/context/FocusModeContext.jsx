'use client';

import { createContext, useCallback, useContext, useState } from 'react';

const FocusModeContext = createContext(null);

export function FocusModeProvider({ children }) {
	const [focusPageId, setFocusPageId] = useState(null);
	const [focusOrigin, setFocusOrigin] = useState(null);

	const enterFocusMode = useCallback((pageId, originRect) => {
		setFocusPageId(pageId);
		setFocusOrigin(originRect);
	});

	const exitFocusMode = useCallback(() => {
		setFocusPageId(null);
		setFocusOrigin(null);
	}, []);

	return (
		<FocusModeContext.Provider
			value={{ focusPageId, focusOrigin, enterFocusMode, exitFocusMode }}>
			{children}
		</FocusModeContext.Provider>
	);
}

export function useFocusMode() {
	const context = useContext(FocusModeContext);
	if (!context) {
		throw new Error('useFocusMode must be used within FocusModeProvider');
	}
	return context;
}

'use client';

import { createContext, useCallback, useContext, useState } from 'react';

const FocusModeContext = createContext(null);

export function FocusModeProvider({ children }) {
	const [focusPageId, setFocusPageId] = useState(null);
	const [focusOrigin, setFocusOrigin] = useState(null);
	const [isFocusExiting, setIsFocusExiting] = useState(false);

	const enterFocusMode = useCallback((pageId, originRect) => {
		setIsFocusExiting(false);
		setFocusPageId(pageId);
		setFocusOrigin(originRect);
	}, []);

	const exitFocusMode = useCallback(() => {
		setFocusPageId((currentPageId) => {
			if (!currentPageId) {
				return null;
			}

			setIsFocusExiting(true);
			return currentPageId;
		});
	}, []);

	const completeFocusExit = useCallback(() => {
		setFocusPageId(null);
		setFocusOrigin(null);
		setIsFocusExiting(false);
	}, []);

	return (
		<FocusModeContext.Provider
			value={{
				focusPageId,
				focusOrigin,
				isFocusExiting,
				enterFocusMode,
				exitFocusMode,
				completeFocusExit,
			}}>
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

export const THEME_STORAGE_KEY = 'foli-theme';

export function applyTheme(theme) {
	if (theme !== 'light' && theme !== 'dark') {
		return;
	}

	document.documentElement.setAttribute('data-theme', theme);

	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// ignore storage errors (private mode, etc.)
	}
}

'use client';

const DEFAULT_PRIMARY = '#7241c1';

export const getPrimaryHighlightColor = () => {
	if (typeof window === 'undefined') {
		return DEFAULT_PRIMARY;
	}

	const primary =
		getComputedStyle(document.documentElement)
			.getPropertyValue('--color-primary')
			.trim() || DEFAULT_PRIMARY;

	return primary;
};

export const selectionHasBackground = (quill, range) => {
	if (!quill || !range || range.length === 0) {
		return false;
	}

	const format = quill.getFormat(range.index, range.length);
	if (format.background) {
		return true;
	}

	for (let index = range.index; index < range.index + range.length; index += 1) {
		if (quill.getFormat(index, 1).background) {
			return true;
		}
	}

	return false;
};

'use client';

export const HIGHLIGHT_TEXT_COLOR = '#ffffff';

export const HIGHLIGHT_OPTIONS = [
	{ label: 'Green', color: '#5BC141' },
	{ label: 'Gold', color: '#C19441' },
	{ label: 'Red', color: '#C14141' },
	{ label: 'Purple', color: '#7241C1' },
];

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

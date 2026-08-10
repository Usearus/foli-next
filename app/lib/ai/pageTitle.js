export const PAGE_TITLE_MAX_CHAR = 32;
export const PAGE_TITLE_PLACEHOLDER = '(No title)';

export function getPageTitleLabel(title) {
	const trimmed = title?.trim();
	return trimmed || PAGE_TITLE_PLACEHOLDER;
}

export function isPageTitleEmpty(title) {
	return !title?.trim();
}

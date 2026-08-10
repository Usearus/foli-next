export function isJobDescriptionPage(page) {
	return Boolean(page?.locked || page?.title === 'Job Description');
}

export function splitPagesByJobDescription(pages) {
	const sorted = [...pages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
	const jobDescriptionPage = sorted.find(isJobDescriptionPage) ?? null;
	const draggablePages = sorted.filter((page) => !isJobDescriptionPage(page));

	return { jobDescriptionPage, draggablePages };
}

/** Job Description first (position 0), then everything else in order. */
export function normalizePageOrder(pages) {
	const { jobDescriptionPage, draggablePages } = splitPagesByJobDescription(pages);

	if (!jobDescriptionPage) {
		return draggablePages.map((page, index) => ({ ...page, position: index }));
	}

	return [
		{ ...jobDescriptionPage, position: 0 },
		...draggablePages.map((page, index) => ({ ...page, position: index + 1 })),
	];
}

export function reorderDraggablePages(pages, sourceIndex, destinationIndex) {
	const { jobDescriptionPage, draggablePages } = splitPagesByJobDescription(pages);
	const nextDraggable = Array.from(draggablePages);
	const [movedPage] = nextDraggable.splice(sourceIndex, 1);
	nextDraggable.splice(destinationIndex, 0, movedPage);

	if (!jobDescriptionPage) {
		return nextDraggable.map((page, index) => ({ ...page, position: index }));
	}

	return [
		{ ...jobDescriptionPage, position: 0 },
		...nextDraggable.map((page, index) => ({ ...page, position: index + 1 })),
	];
}

export function pageOrderChanged(before, after) {
	if (before.length !== after.length) return true;
	return after.some((page, index) => before[index]?.id !== page.id);
}

export const QUESTION_TYPE_PRACTICE = 'practice';
export const QUESTION_TYPE_MY_QUESTION = 'my question';

export const PRACTICE_CATEGORIES = [
	'Behavioral (STAR)',
	'Role & skills',
	'General',
];

export const STAR_ANSWER_TEMPLATE =
	'Situation:\n\nTask:\n\nAction:\n\nResult:';

export const MY_QUESTION_CATEGORIES = [
	'Initial screener',
	'Hiring manager',
	'Group interview',
	'Tactical',
	'Closing questions',
	'General',
];

export const MY_QUESTION_FILTER_ALL = 'All';

export function isPracticeQuestion(questionItem) {
	return questionItem?.type === QUESTION_TYPE_PRACTICE;
}

export function isMyQuestion(questionItem) {
	return questionItem?.type === QUESTION_TYPE_MY_QUESTION;
}

export function isStarCategory(category) {
	return category === 'Behavioral (STAR)';
}

export function getMyQuestionCategory(questionItem) {
	return questionItem?.category || 'General';
}

export function filterMyQuestionsByCategory(questions, categoryFilter) {
	if (categoryFilter === MY_QUESTION_FILTER_ALL) return questions;
	return questions.filter(
		(question) => getMyQuestionCategory(question) === categoryFilter,
	);
}

export function filterQuestionsBySearch(questions, query) {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) return questions;

	return questions.filter((questionItem) => {
		const question = (questionItem.question || '').toLowerCase();
		const response = (questionItem.response || '').toLowerCase();
		const category = (questionItem.category || '').toLowerCase();

		return (
			question.includes(trimmed) ||
			response.includes(trimmed) ||
			category.includes(trimmed)
		);
	});
}

export const SELECTED_MY_QUESTIONS_KEY = 'foli-selected-employer-questions';

export function getSelectedMyQuestionIds() {
	try {
		const stored = localStorage.getItem(SELECTED_MY_QUESTIONS_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

export function setSelectedMyQuestionIds(ids) {
	localStorage.setItem(SELECTED_MY_QUESTIONS_KEY, JSON.stringify(ids));
}

export function formatMyQuestionsForSheet(questions) {
	const items = questions.map((q) => q.question?.trim()).filter(Boolean);

	const listItems = items
		.map((text) => `<li><span style="font-size: 14px;">${escapeHtml(text)}</span></li>`)
		.join('');

	const html = `<h2><span style="font-size: 20px;">Questions to ask</span></h2><p><br></p><ol>${listItems}</ol>`;
	const plain = items.map((text, index) => `${index + 1}. ${text}`).join('\n');

	return { html, plain };
}

function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export async function copyMyQuestionsToClipboard(questions) {
	const { html, plain } = formatMyQuestionsForSheet(questions);

	if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
		await navigator.clipboard.write([
			new ClipboardItem({
				'text/html': new Blob([html], { type: 'text/html' }),
				'text/plain': new Blob([plain], { type: 'text/plain' }),
			}),
		]);
		return;
	}

	await navigator.clipboard.writeText(plain);
}

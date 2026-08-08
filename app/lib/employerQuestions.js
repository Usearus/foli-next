import { INTERVIEWER_CATEGORIES } from './interviewerQuestions';

export const EMPLOYER_QUESTION_CATEGORY = 'Ask employer';

export const EMPLOYER_QUESTION_FILTER_ALL = 'All';

export const EMPLOYER_QUESTION_TYPES = [
	'Initial screener',
	'Hiring manager',
	'Group interview',
	'Tactical',
	'Closing questions',
	'General',
];

const LEGACY_EMPLOYER_CATEGORIES = new Set([
	'Product design',
	'Initial screener',
	'Hiring manager',
	'Group interview',
	'Closing questions',
]);

const DEPRECATED_TYPE_MAP = {
	Role: 'Tactical',
	'Product design': 'Tactical',
	'Culture & team': 'Hiring manager',
	Process: 'Initial screener',
	Closing: 'Closing questions',
};

function normalizeEmployerType(type) {
	return DEPRECATED_TYPE_MAP[type] || type;
}

export function employerCategory(type = 'General') {
	return `${EMPLOYER_QUESTION_CATEGORY} - ${type}`;
}

export function getEmployerQuestionType(questionItem) {
	const category = questionItem?.category || '';
	if (category.startsWith(`${EMPLOYER_QUESTION_CATEGORY} - `)) {
		const type = category.replace(`${EMPLOYER_QUESTION_CATEGORY} - `, '');
		return normalizeEmployerType(type);
	}
	if (LEGACY_EMPLOYER_CATEGORIES.has(category)) {
		return normalizeEmployerType(category);
	}
	return 'General';
}

export function filterEmployerQuestionsByType(questions, typeFilter) {
	if (typeFilter === EMPLOYER_QUESTION_FILTER_ALL) return questions;
	return questions.filter((q) => getEmployerQuestionType(q) === typeFilter);
}

export function isEmployerQuestion(questionItem) {
	const category = questionItem?.category || '';
	if (category.startsWith(EMPLOYER_QUESTION_CATEGORY)) return true;
	if (LEGACY_EMPLOYER_CATEGORIES.has(category)) return true;
	if (INTERVIEWER_CATEGORIES.includes(category)) return false;
	if (category.startsWith('_')) return false;
	if (category === 'Behavioral (STAR)' || category === 'Role & skills') return false;
	return false;
}

export const SELECTED_EMPLOYER_QUESTIONS_KEY = 'foli-selected-employer-questions';

export function getSelectedEmployerQuestionIds() {
	try {
		const stored = localStorage.getItem(SELECTED_EMPLOYER_QUESTIONS_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

export function setSelectedEmployerQuestionIds(ids) {
	localStorage.setItem(SELECTED_EMPLOYER_QUESTIONS_KEY, JSON.stringify(ids));
}

export function formatEmployerQuestionsForSheet(questions) {
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

export async function copyEmployerQuestionsToClipboard(questions) {
	const { html, plain } = formatEmployerQuestionsForSheet(questions);

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

export const STARTER_EMPLOYER_QUESTIONS = [
	{
		category: employerCategory('Hiring manager'),
		question: 'How would you describe the company culture on this team?',
		response: null,
	},
	{
		category: employerCategory('Hiring manager'),
		question: 'What does success look like in this role in the first 90 days?',
		response: null,
	},
	{
		category: employerCategory('Group interview'),
		question: 'What are the biggest challenges the team is facing right now?',
		response: null,
	},
	{
		category: employerCategory('Tactical'),
		question: 'How do you see this role evolving over the next year?',
		response: null,
	},
	{
		category: employerCategory('Group interview'),
		question: 'What do you enjoy most about working here?',
		response: null,
	},
	{
		category: employerCategory('Closing questions'),
		question: 'What are the next steps in the interview process?',
		response: null,
	},
];

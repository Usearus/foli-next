export const INTERVIEWER_CATEGORIES = [
	'Behavioral (STAR)',
	'Role & skills',
	'General',
];

const CANDIDATE_ASK_CATEGORIES = new Set([
	'Product design',
	'Initial screener',
	'Hiring manager',
	'Group interview',
	'Closing questions',
]);

export function isInterviewerQuestion(questionItem) {
	const category = questionItem?.category || '';
	if (category.startsWith('Ask employer')) return false;
	if (INTERVIEWER_CATEGORIES.includes(category)) return true;
	if (category.startsWith('_')) return true;
	return !CANDIDATE_ASK_CATEGORIES.has(category);
}

export const STAR_ANSWER_TEMPLATE =
	'Situation:\n\nTask:\n\nAction:\n\nResult:';

export const STARTER_INTERVIEWER_QUESTIONS = [
	{
		category: 'Behavioral (STAR)',
		question:
			'Tell me about a time when you had to deal with a difficult stakeholder or teammate.',
		response: STAR_ANSWER_TEMPLATE,
	},
	{
		category: 'Behavioral (STAR)',
		question:
			'Tell me about a time when something did not go as planned. What did you do?',
		response: STAR_ANSWER_TEMPLATE,
	},
	{
		category: 'Behavioral (STAR)',
		question:
			'Tell me about a time when you had to prioritize competing deadlines or projects.',
		response: STAR_ANSWER_TEMPLATE,
	},
	{
		category: 'Behavioral (STAR)',
		question:
			'Describe a situation where you had to persuade others to adopt your idea or approach.',
		response: STAR_ANSWER_TEMPLATE,
	},
	{
		category: 'Behavioral (STAR)',
		question:
			'Tell me about a time when you received critical feedback. How did you respond?',
		response: STAR_ANSWER_TEMPLATE,
	},
	{
		category: 'Role & skills',
		question: 'Walk me through your relevant experience for this role.',
		response: null,
	},
	{
		category: 'General',
		question: 'Why are you interested in this role and our company?',
		response: null,
	},
	{
		category: 'General',
		question: 'What are your greatest strengths and how do they apply here?',
		response: null,
	},
];

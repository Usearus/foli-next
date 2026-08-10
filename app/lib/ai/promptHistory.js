import { DEFAULT_USER } from '../../config/user';

const STORAGE_KEY = `foli-ai-prompt-history:${DEFAULT_USER.email}`;
const MAX_PROMPTS = 30;

function readPromptHistory() {
	if (typeof window === 'undefined') {
		return [];
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return [];
		}

		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writePromptHistory(prompts) {
	if (typeof window === 'undefined') {
		return;
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function getPromptHistory() {
	return readPromptHistory();
}

export function savePromptToHistory(text) {
	const trimmed = text?.trim();
	if (!trimmed) {
		return getPromptHistory();
	}

	const existing = readPromptHistory().filter((item) => item.text !== trimmed);
	const next = [
		{
			id: crypto.randomUUID(),
			text: trimmed,
			createdAt: new Date().toISOString(),
		},
		...existing,
	].slice(0, MAX_PROMPTS);

	writePromptHistory(next);
	return next;
}

export function deletePromptFromHistory(id) {
	const next = readPromptHistory().filter((item) => item.id !== id);
	writePromptHistory(next);
	return next;
}

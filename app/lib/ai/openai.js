import OpenAI from 'openai';

let openaiClient;

export function getOpenAIClient() {
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured');
	}

	if (!openaiClient) {
		openaiClient = new OpenAI({ apiKey });
	}

	return openaiClient;
}

export function getOpenAIModel() {
	return process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
}

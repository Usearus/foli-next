import { getOpenAIClient, getOpenAIModel } from '../../../lib/ai/openai';
import { PAGE_TITLE_MAX_CHAR } from '../../../lib/ai/pageTitle';

function stripHtml(html) {
	if (!html) return '';
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizeTitle(title) {
	const cleaned = title
		.replace(/^["'`]+|["'`]+$/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	if (!cleaned) {
		return 'AI Page';
	}

	if (cleaned.length <= PAGE_TITLE_MAX_CHAR) {
		return cleaned;
	}

	return cleaned.slice(0, PAGE_TITLE_MAX_CHAR).trim();
}

export async function POST(request) {
	try {
		const body = await request.json();
		const prompt = body?.prompt?.trim();
		const content = body?.content?.trim();

		if (!prompt || !content) {
			return Response.json(
				{ error: 'prompt and content are required' },
				{ status: 400 },
			);
		}

		const openai = getOpenAIClient();
		const completion = await openai.chat.completions.create({
			model: getOpenAIModel(),
			messages: [
				{
					role: 'system',
					content: `Suggest a short page title for a job application workspace. Maximum ${PAGE_TITLE_MAX_CHAR} characters. Reply with only the title text — no quotes, markdown, numbering, or explanation.`,
				},
				{
					role: 'user',
					content: `User request:\n${prompt}\n\nGenerated content preview:\n${stripHtml(content).slice(0, 800)}`,
				},
			],
		});

		const title = normalizeTitle(
			completion.choices[0]?.message?.content?.trim() ?? '',
		);

		return Response.json({ title });
	} catch (error) {
		console.error('[api/ai/infer-title]', error);

		if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
			return Response.json(
				{ error: 'OpenAI is not configured on the server' },
				{ status: 500 },
			);
		}

		return Response.json({ error: 'Failed to infer page title' }, { status: 500 });
	}
}

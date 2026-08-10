import { getOpenAIClient, getOpenAIModel } from '../../../lib/ai/openai';
import { fetchAgentContext } from '../../../lib/ai/fetchAgentContext';
import { buildSystemPrompt } from '../../../lib/ai/buildSystemPrompt';
import { formatAiReply } from '../../../lib/ai/formatAiReply';

const DEFAULT_SYSTEM_PROMPT =
	'You are Foli, a helpful assistant for job seekers. Be concise and practical.';

export async function POST(request) {
	try {
		const body = await request.json();
		const message = body?.message?.trim();
		const jobId = body?.jobId ?? null;
		const pageId = body?.pageId ?? null;
		const templateId = body?.templateId ?? null;
		const createPage = Boolean(body?.createPage);
		const systemContextOverride = body?.systemContext?.trim();

		if (!message) {
			return Response.json({ error: 'message is required' }, { status: 400 });
		}

		let systemContext = systemContextOverride;

		if (!systemContext) {
			const agentContext = await fetchAgentContext({
				jobId,
				pageId: createPage ? null : pageId,
				templateId: createPage ? null : templateId,
			});
			systemContext =
				buildSystemPrompt({ ...agentContext, isNewPage: createPage }) ||
				DEFAULT_SYSTEM_PROMPT;
		}

		const openai = getOpenAIClient();
		const completion = await openai.chat.completions.create({
			model: getOpenAIModel(),
			messages: [
				{ role: 'system', content: systemContext },
				{ role: 'user', content: message },
			],
		});

		const reply = completion.choices[0]?.message?.content?.trim();

		if (!reply) {
			return Response.json(
				{ error: 'OpenAI returned an empty response' },
				{ status: 502 },
			);
		}

		return Response.json({ reply: formatAiReply(reply) });
	} catch (error) {
		console.error('[api/ai/chat]', error);

		if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
			return Response.json(
				{ error: 'OpenAI is not configured on the server' },
				{ status: 500 },
			);
		}

		if (error instanceof Error && error.message.includes('SUPABASE')) {
			return Response.json(
				{ error: 'Database is not configured on the server' },
				{ status: 500 },
			);
		}

		return Response.json({ error: 'Failed to generate a response' }, { status: 500 });
	}
}

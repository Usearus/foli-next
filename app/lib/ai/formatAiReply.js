import Showdown from 'showdown';

const converter = new Showdown.Converter({
	simpleLineBreaks: false,
	openLinksInNewWindow: true,
	ghCodeBlocks: true,
});

function looksLikeHtml(text) {
	return /<\/?[a-z][\s\S]*>/i.test(text);
}

export function formatAiReply(text) {
	if (!text?.trim()) {
		return '';
	}

	if (looksLikeHtml(text)) {
		return text;
	}

	return converter.makeHtml(text);
}

export const AI_FORMATTING_RULES = [
	'## Response formatting',
	'Always format responses as HTML, never Markdown.',
	'Do not use Markdown syntax such as **bold**, *italic*, # headings, or - lists.',
	'Use HTML tags instead: <strong>, <em>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <br>.',
	'For analysis or advice (not a full page rewrite), use <h3> for section titles, <p> for paragraphs, and <ul>/<li> for bullet lists.',
	'When rewriting page content to apply to the editor, return only the HTML body content with no markdown fences or explanations.',
].join('\n');

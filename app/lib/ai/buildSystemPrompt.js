import { AI_FORMATTING_RULES } from './formatAiReply';

const PAGE_CONTENT_MAX_CHARS = 8000;

function formatSalaryRange(job) {
	if (job.salary_min && job.salary_max) {
		return `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`;
	}

	if (job.salary_min) {
		return `$${job.salary_min.toLocaleString()}+`;
	}

	if (job.salary_max) {
		return `Up to $${job.salary_max.toLocaleString()}`;
	}

	return null;
}

function truncateContent(content) {
	if (!content) return '';

	if (content.length <= PAGE_CONTENT_MAX_CHARS) {
		return content;
	}

	return `${content.slice(0, PAGE_CONTENT_MAX_CHARS)}…`;
}

export function buildSystemPrompt({
	profile,
	job,
	page,
	template,
	isNewPage,
} = {}) {
	const sections = [
		'You are Foli, an AI writing assistant for job seekers.',
		'Help the user improve application materials. Be concise, specific, and practical.',
		AI_FORMATTING_RULES,
	];

	if (isNewPage) {
		sections.push(
			'The user is creating a new page for this job. Generate complete page content they can use as a starting point.',
		);
	}

	if (profile?.ai_context?.trim()) {
		sections.push(`## User background\n${profile.ai_context.trim()}`);
	}

	if (profile?.position?.trim()) {
		sections.push(`## Target position\n${profile.position.trim()}`);
	}

	if (job) {
		const jobDetails = [
			job.company ? `Company: ${job.company}` : null,
			job.position ? `Role: ${job.position}` : null,
			job.status ? `Status: ${job.status}` : null,
			job.location ? `Location: ${job.location}` : null,
			job.remote ? 'Work style: Remote / hybrid' : null,
			formatSalaryRange(job) ? `Salary: ${formatSalaryRange(job)}` : null,
			job.link ? `Job posting: ${job.link}` : null,
		].filter(Boolean);

		if (jobDetails.length > 0) {
			sections.push(`## Current job\n${jobDetails.join('\n')}`);
		}
	}

	if (page) {
		const pageContent = truncateContent(page.content?.trim() ?? '');
		sections.push(
			`## Current page: ${page.title?.trim() || 'Untitled'}\n${
				pageContent || '(empty page)'
			}`,
		);
	}

	if (template) {
		const resumeContent = truncateContent(template.content?.trim() ?? '');
		sections.push(
			'The user is editing their master resume — the canonical resume they duplicate for each application.',
			`## Master resume\n${resumeContent || '(empty resume)'}`,
		);
	}

	return sections.join('\n\n');
}

import { supabase } from '../api/supabase';
import { isMasterResumeTemplate } from './masterResumeTemplate';

export const CUSTOM_TEMPLATE_STATUS = 'Saved';

export function findCustomTemplateByTitle(templates, title) {
	const normalizedTitle = title.trim().toLowerCase();
	if (!normalizedTitle) return null;

	return (
		templates.find(
			(template) =>
				template.category === 'Custom' &&
				template.title?.trim().toLowerCase() === normalizedTitle,
		) ?? null
	);
}

export async function savePageAsTemplate({ title, content }) {
	return supabase
		.from('templates')
		.insert({
			title,
			content: content ?? '',
			category: 'Custom',
			status: CUSTOM_TEMPLATE_STATUS,
			description: '',
		})
		.select()
		.single();
}

export async function updateCustomTemplate({ id, title, content }) {
	return supabase
		.from('templates')
		.update({
			title,
			content: content ?? '',
		})
		.eq('id', id)
		.select()
		.single();
}

'use client';

import { supabase } from '../api/supabase';

export const MASTER_RESUME_TEMPLATE = {
	title: 'Master Resume',
	category: 'Custom',
	status: 'Master Resume',
	description: 'Your master resume template',
};

export const getMasterResumeContent = (template) => template?.content ?? '';

export function isMasterResumeTemplate(template) {
	return (
		template?.status === MASTER_RESUME_TEMPLATE.status ||
		template?.title === MASTER_RESUME_TEMPLATE.title
	);
}

export async function fetchMasterResumeTemplate() {
	return supabase
		.from('templates')
		.select('*')
		.eq('category', MASTER_RESUME_TEMPLATE.category)
		.eq('status', MASTER_RESUME_TEMPLATE.status)
		.eq('title', MASTER_RESUME_TEMPLATE.title)
		.order('created_at', { ascending: true })
		.limit(1)
		.maybeSingle();
}

export async function createMasterResumeTemplate() {
	return supabase
		.from('templates')
		.insert({
			...MASTER_RESUME_TEMPLATE,
			content: '',
		})
		.select()
		.single();
}

export async function updateMasterResumeTemplate(templateId, content) {
	return supabase
		.from('templates')
		.update({ content })
		.eq('id', templateId)
		.select()
		.single();
}

export async function duplicateMasterResumeForJob({
	jobId,
	account,
	content,
	title = 'Resume',
}) {
	const { data: pages, error: fetchError } = await supabase
		.from('pages')
		.select('id')
		.eq('jobid', jobId);

	if (fetchError) {
		return { data: null, error: fetchError };
	}

	return supabase
		.from('pages')
		.insert({
			account,
			title,
			content,
			jobid: jobId,
			position: pages?.length ?? 0,
		})
		.select()
		.single();
}

export async function fetchJobDescriptionContent(jobId) {
	if (!jobId) {
		return null;
	}

	const { data, error } = await supabase
		.from('pages')
		.select('content')
		.eq('jobid', jobId)
		.eq('title', 'Job Description')
		.maybeSingle();

	if (error) {
		console.error(error);
		return null;
	}

	return data?.content ?? null;
}

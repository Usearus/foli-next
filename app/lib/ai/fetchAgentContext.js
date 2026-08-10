import { DEFAULT_USER } from '../../config/user';
import { createServerSupabaseClient } from '../supabase/server';

export async function fetchAgentContext({ jobId, pageId, templateId } = {}) {
	const supabase = createServerSupabaseClient();
	const account = DEFAULT_USER.email;

	const profileQuery = supabase
		.from('profiles')
		.select('ai_context, position')
		.eq('email', account)
		.maybeSingle();

	const jobQuery = jobId
		? supabase
				.from('jobs')
				.select('*')
				.eq('id', jobId)
				.eq('account', account)
				.maybeSingle()
		: Promise.resolve({ data: null, error: null });

	const pageQuery =
		jobId && pageId
			? supabase
					.from('pages')
					.select('id, title, content, jobid')
					.eq('id', pageId)
					.eq('jobid', jobId)
					.eq('account', account)
					.maybeSingle()
			: Promise.resolve({ data: null, error: null });

	const templateQuery = templateId
		? supabase
				.from('templates')
				.select('id, title, content')
				.eq('id', templateId)
				.maybeSingle()
		: Promise.resolve({ data: null, error: null });

	const [profileResult, jobResult, pageResult, templateResult] =
		await Promise.all([profileQuery, jobQuery, pageQuery, templateQuery]);

	if (profileResult.error) throw profileResult.error;
	if (jobResult.error) throw jobResult.error;
	if (pageResult.error) throw pageResult.error;
	if (templateResult.error) throw templateResult.error;

	return {
		profile: profileResult.data,
		job: jobResult.data,
		page: pageResult.data,
		template: templateResult.data,
	};
}

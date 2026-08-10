import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtnxcphjphyiotsorwtx.supabase.co';

export function createServerSupabaseClient() {
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

	if (!supabaseKey) {
		throw new Error('NEXT_PUBLIC_SUPABASE_KEY is not configured');
	}

	return createClient(supabaseUrl, supabaseKey);
}

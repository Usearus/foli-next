import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

// export default withMiddlewareAuthRequired();

import { NextResponse } from 'next/server';

const middleware = withMiddlewareAuthRequired({
	onUnauthenticated: (req) => {
		const url = req.nextUrl.clone();
		url.pathname = '/landing'; // Redirect to your custom landing page
		return NextResponse.redirect(url);
	},
});

export default middleware;

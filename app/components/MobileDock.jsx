'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	ChatBubbleIcon,
	HomeIcon,
	Pencil1Icon,
} from '@radix-ui/react-icons';
import { useFocusMode } from '../context/FocusModeContext';
import { DEFAULT_USER } from '../config/user';
import { mainNavItems } from '../lib/nav';

const userInitials = DEFAULT_USER.name
	.split(' ')
	.map((part) => part[0])
	.join('')
	.slice(0, 2)
	.toUpperCase();

const dockIcons = {
	'/': HomeIcon,
	'/practice': Pencil1Icon,
	'/my-questions': ChatBubbleIcon,
};

const dockItems = [
	...mainNavItems.map((item) => ({
		...item,
		icon: dockIcons[item.href],
	})),
	{
		href: '/settings',
		label: 'Settings',
		match: (pathname) => pathname.startsWith('/settings'),
		profile: true,
	},
];

const MobileDock = () => {
	const pathname = usePathname();
	const { focusPageId } = useFocusMode();

	if (focusPageId) {
		return null;
	}

	return (
		<div className='dock dock-md md:hidden'>
			{dockItems.map(({ href, label, icon: Icon, match, profile }) => (
				<Link
					key={href}
					href={href}
					className={match(pathname) ? 'dock-active' : undefined}
					aria-current={match(pathname) ? 'page' : undefined}>
					{profile ? (
						<div className='avatar avatar-placeholder'>
							<div className='bg-base-100 text-base-content w-8 rounded-full'>
								<span className='text-xs'>{userInitials}</span>
							</div>
						</div>
					) : (
						<Icon className='size-[1.2em]' />
					)}
					<span className='dock-label'>{label}</span>
				</Link>
			))}
		</div>
	);
};

export default MobileDock;

import { Inter } from 'next/font/google';
import './globals.css';
import './quillStyles.css';
import { DatabaseProvider } from './context/DatabaseContext';
import NavBar from './components/NavBar';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import AlertPopup from './alerts/AlertPopup';
import { AlertProvider } from './alerts/AlertContext';

export const metadata = {
	title: 'Foli-NEXT',
	description: 'Generated by Adam',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<UserProvider>
				<body className={inter.className}>
					<DatabaseProvider>
						<AlertProvider>
							{/* This is 'relative' so that the alert can be positioned 'absolute'. */}
							<div className='flex flex-col h-screen bg-base-200 relative'>
								<NavBar />
								<AlertPopup />
								{/* 'Overflow-y-auto' keeps the navbar fixed at the top. Flex-grow makes it take up all the space the navbar doesn't. */}
								<div className='flex-grow overflow-y-auto'>{children}</div>
							</div>
						</AlertProvider>
					</DatabaseProvider>
				</body>
			</UserProvider>
		</html>
	);
}

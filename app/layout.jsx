import { Inter } from 'next/font/google';
import './globals.css';
import { DatabaseProvider } from './context/DatabaseContext';
import NavBar from './components/NavBar';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Foli-NEXT',
	description: 'Generated by Adam',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<UserProvider>
				<body className={inter.className}>
					<DatabaseProvider>
						<div className='flex flex-col h-screen'>
							<NavBar />
							<div className='flex-grow overflow-y-auto'>{children}</div>
						</div>
					</DatabaseProvider>
				</body>
			</UserProvider>
		</html>
	);
}

'use client';

import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { supabase } from '../api/supabase';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

const ThemeToggle = () => {
	const { userTheme, userProfile, setUserTheme } = useContext(DatabaseContext);

	const handleThemeUpdate = async () => {
		const oppositeTheme = userTheme === 'light' ? 'dark' : 'light';

		// Update the user's theme in Supabase
		const { error } = await supabase
			.from('profiles')
			.update({ theme: oppositeTheme })
			.eq('id', userProfile.id);

		if (error) {
			console.log('Error updating theme:', error);
			return;
		}

		setUserTheme(oppositeTheme);
		document.documentElement.setAttribute('data-theme', oppositeTheme);
		// console.log('Theme successfully updated to:', oppositeTheme);
	};

	return (
		<div className='flex flex-row gap-2 items-center text-base-content'>
			<input
				type='checkbox'
				className='toggle'
				checked={userTheme === 'dark'}
				onChange={handleThemeUpdate}
			/>
			{userTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
		</div>
	);
};

export default ThemeToggle;

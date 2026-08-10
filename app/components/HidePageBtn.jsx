'use client';

import { EyeClosedIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { supabase } from '../api/supabase';
import useAlert from '../alerts/useAlert';

const HidePageBtn = ({ page, label = 'Hide sheet' }) => {
	const { fetchCurrentPages, currentJob } = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	const handleHide = async (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (!page.visible) {
			return;
		}

		const { error } = await supabase
			.from('pages')
			.update({ visible: false })
			.eq('id', page.id);

		if (error) {
			setAlert('Unable to hide sheet', 'error');
			console.log(error);
			return;
		}

		document.activeElement?.blur();
		await fetchCurrentPages(currentJob);
	};

	if (!page.visible) {
		return null;
	}

	return (
		<button type='button' className='flex items-center' onClick={handleHide}>
			<EyeClosedIcon className='inline-block size-4 mr-2 shrink-0' />
			{label}
		</button>
	);
};

export default HidePageBtn;

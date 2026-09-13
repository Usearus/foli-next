'use client';

import { useState } from 'react';
import { DownloadIcon } from '@radix-ui/react-icons';
import useAlert from '../alerts/useAlert';
import { exportSheetPdf } from '../lib/exportSheetPdf';

const ExportSheetPdfBtn = ({ company, title, content, getTitle }) => {
	const { setAlert } = useAlert();
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async (event) => {
		event.preventDefault();
		event.stopPropagation();

		if (isExporting) {
			return;
		}

		document.activeElement?.blur();
		setIsExporting(true);

		try {
			await exportSheetPdf({
				company,
				title: getTitle?.() ?? title ?? '',
				content,
			});
		} catch (error) {
			console.error('[exportSheetPdf]', error);
			setAlert('Unable to export PDF', 'error');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<button
			type='button'
			className='flex items-center'
			onClick={handleExport}
			disabled={isExporting}
			aria-busy={isExporting}>
			<DownloadIcon className='inline-block size-4 mr-2 shrink-0' />
			{isExporting ? 'Exporting…' : 'Export to PDF'}
		</button>
	);
};

export default ExportSheetPdfBtn;

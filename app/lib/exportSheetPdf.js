import { PAGE_TITLE_PLACEHOLDER } from './ai/pageTitle';

const EXPORT_WIDTH_PX = 680;
const PDF_MARGIN_PT = 36;
const INLINE_FONT_SCALE = 0.9;

function sanitizeFilenamePart(value, fallback = '') {
	const cleaned = (value || '')
		.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	if (!cleaned || cleaned === PAGE_TITLE_PLACEHOLDER) {
		return fallback;
	}

	return cleaned;
}

export function getSheetPdfFilename({ company, title } = {}) {
	const companyPart = sanitizeFilenamePart(company);
	const titlePart = sanitizeFilenamePart(title, 'Untitled sheet');

	if (companyPart && titlePart) {
		return `${companyPart} - ${titlePart}.pdf`;
	}

	if (companyPart) {
		return `${companyPart}.pdf`;
	}

	return `${titlePart}.pdf`;
}

function applyLightExportColors(root) {
	root.style.setProperty('background-color', '#ffffff', 'important');
	root.style.setProperty('color', '#111111', 'important');
	root.querySelectorAll('*').forEach((element) => {
		element.style.setProperty('color', '#111111', 'important');
		element.style.setProperty('background-color', 'transparent', 'important');
	});
}

function scaleInlineFonts(root) {
	root.querySelectorAll('[style]').forEach((element) => {
		const size = element.style.fontSize;
		if (!size) {
			return;
		}

		const px = parseFloat(size);
		if (!Number.isFinite(px)) {
			return;
		}

		element.style.setProperty(
			'font-size',
			`${Math.max(px * INLINE_FONT_SCALE, 10)}px`,
			'important',
		);
	});
}

export async function exportSheetPdf({ company, title, content }) {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		throw new Error('PDF export is only available in the browser');
	}

	const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
		import('html2canvas-pro'),
		import('jspdf'),
	]);

	const host = document.createElement('div');
	host.className = 'sheet-pdf-export page-sheet-container';
	host.setAttribute('data-theme', 'light');

	const body = document.createElement('div');
	body.className = 'page-sheet-prose ql-editor sheet-pdf-export__body';
	body.innerHTML = content || '';

	host.append(body);
	document.body.append(host);
	applyLightExportColors(host);
	scaleInlineFonts(host);

	try {
		const canvas = await html2canvas(host, {
			scale: 2,
			backgroundColor: '#ffffff',
			useCORS: true,
			logging: false,
			width: EXPORT_WIDTH_PX,
			windowWidth: EXPORT_WIDTH_PX,
			onclone(clonedDoc, clonedNode) {
				const node =
					clonedNode || clonedDoc.querySelector('.sheet-pdf-export');
				if (!node) {
					return;
				}
				node.style.position = 'static';
				node.style.left = '0';
				node.style.top = '0';
				applyLightExportColors(node);
				scaleInlineFonts(node);
			},
		});

		const pdf = new jsPDF({
			unit: 'pt',
			format: 'letter',
			orientation: 'portrait',
		});
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const contentWidth = pageWidth - PDF_MARGIN_PT * 2;
		const contentHeight = pageHeight - PDF_MARGIN_PT * 2;
		const pixelsPerPt = canvas.width / contentWidth;
		const pageSourceHeight = Math.max(Math.floor(contentHeight * pixelsPerPt), 1);

		let sourceY = 0;
		let pageIndex = 0;

		while (sourceY < canvas.height) {
			const sliceHeight = Math.min(pageSourceHeight, canvas.height - sourceY);
			const sliceCanvas = document.createElement('canvas');
			sliceCanvas.width = canvas.width;
			sliceCanvas.height = sliceHeight;

			const context = sliceCanvas.getContext('2d');
			context.fillStyle = '#ffffff';
			context.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
			context.drawImage(
				canvas,
				0,
				sourceY,
				canvas.width,
				sliceHeight,
				0,
				0,
				canvas.width,
				sliceHeight,
			);

			if (pageIndex > 0) {
				pdf.addPage();
			}

			pdf.addImage(
				sliceCanvas.toDataURL('image/png'),
				'PNG',
				PDF_MARGIN_PT,
				PDF_MARGIN_PT,
				contentWidth,
				sliceHeight / pixelsPerPt,
				undefined,
				'FAST',
			);

			sourceY += sliceHeight;
			pageIndex += 1;
		}

		pdf.save(getSheetPdfFilename({ company, title }));
	} finally {
		host.remove();
	}
}

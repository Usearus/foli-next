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

function isMostlyBlankRow(context, width, y) {
	const { data } = context.getImageData(0, y, width, 1);
	const inkLimit = Math.max(4, Math.floor(width * 0.008));
	let ink = 0;

	for (let index = 0; index < data.length; index += 4) {
		if (data[index] < 248 || data[index + 1] < 248 || data[index + 2] < 248) {
			ink += 1;
			if (ink > inkLimit) {
				return false;
			}
		}
	}

	return true;
}

function findLineSafeBreak(context, width, startY, intendedEnd, canvasHeight) {
	if (intendedEnd >= canvasHeight) {
		return canvasHeight;
	}

	if (!context) {
		return intendedEnd;
	}

	const minY = startY + Math.floor((intendedEnd - startY) * 0.65);

	for (let y = intendedEnd - 1; y > minY; y -= 1) {
		if (isMostlyBlankRow(context, width, y)) {
			return y + 1;
		}
	}

	return intendedEnd;
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
		const sourceContext = canvas.getContext('2d', { willReadFrequently: true });

		let sourceY = 0;
		let pageIndex = 0;

		while (sourceY < canvas.height) {
			const intendedEnd = Math.min(sourceY + pageSourceHeight, canvas.height);
			const breakY = findLineSafeBreak(
				sourceContext,
				canvas.width,
				sourceY,
				intendedEnd,
				canvas.height,
			);
			const sliceHeight = Math.max(breakY - sourceY, 1);
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

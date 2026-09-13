'use client';

import { Quill } from 'react-quill-new';

const Delta = Quill.import('delta');

const PASTE_ALLOWED_ATTRIBUTES = new Set([
	'bold',
	'italic',
	'underline',
	'link',
	'header',
	'list',
	'indent',
	'align',
	'background',
]);

export const sanitizePastedDelta = (delta) => {
	const cleaned = new Delta();

	delta.ops.forEach((op) => {
		if (op.insert == null) {
			return;
		}

		if (!op.attributes) {
			cleaned.insert(op.insert);
			return;
		}

		const attrs = {};

		PASTE_ALLOWED_ATTRIBUTES.forEach((key) => {
			const value = op.attributes[key];
			if (value == null) {
				return;
			}

			if (key === 'header' && value !== 1 && value !== 2) {
				return;
			}

			attrs[key] = value;
		});

		cleaned.insert(
			op.insert,
			Object.keys(attrs).length > 0 ? attrs : undefined,
		);
	});

	return cleaned;
};

export const setupQuillPasteSanitizer = (quill) => {
	if (!quill || quill.__foliPasteSanitizer) {
		return;
	}

	const clipboard = quill.getModule('clipboard');
	if (!clipboard) {
		return;
	}

	quill.__foliPasteSanitizer = true;

	let isUserPaste = false;
	const markUserPaste = () => {
		isUserPaste = true;
		queueMicrotask(() => {
			isUserPaste = false;
		});
	};

	quill.root.addEventListener('paste', markUserPaste, true);

	clipboard.addMatcher(Node.ELEMENT_NODE, (_node, delta) => {
		if (!isUserPaste) {
			return delta;
		}

		return sanitizePastedDelta(delta);
	});
};

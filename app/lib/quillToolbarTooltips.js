'use client';

const applyTooltip = (element, tip) => {
	if (!element || !tip) {
		return;
	}

	element.classList.add('tooltip', 'tooltip-bottom');
	element.dataset.tip = tip;
};

export const setupQuillToolbarTooltips = (quill) => {
	const toolbar = quill.getModule('toolbar')?.container;
	if (!toolbar) {
		return;
	}

	const buttonTips = {
		'ql-bold': 'Bold',
		'ql-italic': 'Italic',
		'ql-underline': 'Underline',
		'ql-clean': 'Clear',
		'ql-link': 'Link',
	};

	Object.entries(buttonTips).forEach(([className, tip]) => {
		toolbar.querySelectorAll(`button.${className}`).forEach((button) => {
			applyTooltip(button, tip);
		});
	});

	toolbar.querySelectorAll('button.ql-list').forEach((button) => {
		const value = button.getAttribute('value');
		if (value === 'ordered') {
			applyTooltip(button, 'Numbered');
		} else if (value === 'bullet') {
			applyTooltip(button, 'Bullet');
		}
	});

	const pickerTips = {
		'ql-header': 'Heading',
		'ql-align': 'Align',
	};

	Object.entries(pickerTips).forEach(([className, tip]) => {
		toolbar.querySelectorAll(`.ql-picker.${className}`).forEach((picker) => {
			// Apply to the picker, not the label — Quill renders header text on
			// .ql-picker-label::before, which DaisyUI tooltips also use.
			applyTooltip(picker, tip);
		});
	});
};

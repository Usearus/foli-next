'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import { PlusIcon } from '@radix-ui/react-icons';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import {
	PRACTICE_CATEGORIES,
	QUESTION_TYPE_PRACTICE,
	STAR_ANSWER_TEMPLATE,
} from '../lib/questions';

const AddQuestionBtn = () => {
	const { fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [category, setCategory] = useState('Behavioral (STAR)');

	const questionRef = useRef(null);
	const answerRef = useRef(null);

	useEffect(() => {
		if (category === 'Behavioral (STAR)' && answerRef.current) {
			if (!answerRef.current.value.trim()) {
				answerRef.current.value = STAR_ANSWER_TEMPLATE;
			}
		}
	}, [category, isModalOpen]);

	const resetForm = () => {
		setCategory('Behavioral (STAR)');
		if (questionRef.current) questionRef.current.value = '';
		if (answerRef.current) answerRef.current.value = STAR_ANSWER_TEMPLATE;
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		handleAddQuestion();
	};

	const handleAddQuestion = async () => {
		const question = questionRef.current.value.trim();
		if (!question) {
			setAlert('Question is required', 'error');
			return;
		}

		let response = answerRef.current.value.trim() || null;
		if (category === 'Behavioral (STAR)' && response === STAR_ANSWER_TEMPLATE) {
			response = STAR_ANSWER_TEMPLATE;
		}

		const { error } = await supabase.from('questions').insert({
			type: QUESTION_TYPE_PRACTICE,
			category,
			question,
			response,
		});

		if (error) {
			setAlert('Unable to add question', 'error');
			console.log(error);
			return;
		}

		fetchUserQuestions();
		setAlert('Question added', 'success');
		resetForm();
		setIsModalOpen(false);
	};

	const handleCategoryChange = (event) => {
		const nextCategory = event.target.value;
		setCategory(nextCategory);
		if (!answerRef.current) return;

		if (nextCategory === 'Behavioral (STAR)') {
			if (!answerRef.current.value.trim()) {
				answerRef.current.value = STAR_ANSWER_TEMPLATE;
			}
		} else if (answerRef.current.value.trim() === STAR_ANSWER_TEMPLATE) {
			answerRef.current.value = '';
		}
	};

	return (
		<>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Add question they may ask you'>
				<form className='flex flex-col gap-4 pb-4' onSubmit={handleSubmit}>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-question-type'>
							Type
						</label>
						<select
							id='add-question-type'
							value={category}
							onChange={handleCategoryChange}
							className='select w-full bg-base-200'>
							{PRACTICE_CATEGORIES.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</fieldset>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-question-text'>
							Question <span className='text-primary'>*</span>
						</label>
						<textarea
							id='add-question-text'
							required
							ref={questionRef}
							rows={3}
							placeholder='e.g. Tell me about a time when...'
							className='textarea w-full bg-base-200'
						/>
					</fieldset>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-question-answer'>
							Your answer
						</label>
						<textarea
							id='add-question-answer'
							ref={answerRef}
							defaultValue={STAR_ANSWER_TEMPLATE}
							rows={8}
							placeholder='Your prepared answer (optional)'
							className='textarea w-full bg-base-200 font-mono'
						/>
						{category === 'Behavioral (STAR)' ? (
							<p className='label'>Use STAR: Situation, Task, Action, Result</p>
						) : null}
					</fieldset>
					<div className='flex justify-end pt-2'>
						<button type='submit' className='btn btn-primary'>
							Add question
						</button>
					</div>
				</form>
			</Modal>
			<button
				type='button'
				className='btn btn-primary rounded-full'
				onClick={() => {
					resetForm();
					setIsModalOpen(true);
				}}>
				<PlusIcon className='size-4 shrink-0' />
				Add question
			</button>
		</>
	);
};

export default AddQuestionBtn;

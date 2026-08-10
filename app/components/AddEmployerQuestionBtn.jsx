'use client';

import { useState, useContext, useRef } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import { PlusIcon } from '@radix-ui/react-icons';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import {
	MY_QUESTION_CATEGORIES,
	QUESTION_TYPE_MY_QUESTION,
} from '../lib/questions';

const AddEmployerQuestionBtn = () => {
	const { fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [category, setCategory] = useState('Hiring manager');
	const questionRef = useRef(null);

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

		const { error } = await supabase.from('questions').insert({
			type: QUESTION_TYPE_MY_QUESTION,
			category,
			question,
			response: null,
		});

		if (error) {
			setAlert('Unable to add question', 'error');
			console.log(error);
			return;
		}

		fetchUserQuestions();
		setAlert('Question added', 'success');
		questionRef.current.value = '';
		setCategory('Hiring manager');
		setIsModalOpen(false);
	};

	return (
		<>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Add a question for the employer'>
				<form className='flex flex-col gap-4 pb-4' onSubmit={handleSubmit}>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-employer-question-category'>
							Category
						</label>
						<select
							id='add-employer-question-category'
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className='select w-full bg-base-200'>
							{MY_QUESTION_CATEGORIES.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</fieldset>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-employer-question-text'>
							Question <span className='text-primary'>*</span>
						</label>
						<textarea
							id='add-employer-question-text'
							required
							ref={questionRef}
							rows={3}
							placeholder='e.g. What does the onboarding process look like?'
							className='textarea w-full bg-base-200'
						/>
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
				onClick={() => setIsModalOpen(true)}>
				<PlusIcon className='size-4 shrink-0' />
				Add question
			</button>
		</>
	);
};

export default AddEmployerQuestionBtn;

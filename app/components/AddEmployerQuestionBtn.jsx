'use client';

import { useState, useContext, useRef } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import {
	employerCategory,
	EMPLOYER_QUESTION_TYPES,
} from '../lib/employerQuestions';

const AddEmployerQuestionBtn = () => {
	const { fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [type, setType] = useState('Hiring manager');
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
			category: employerCategory(type),
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
		setType('Hiring manager');
		setIsModalOpen(false);
	};

	return (
		<>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Add a question for the employer'>
				<form className='flex flex-col gap-4 pb-4' onSubmit={handleSubmit}>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Type</span>
						</div>
						<select
							value={type}
							onChange={(e) => setType(e.target.value)}
							className='select select-bordered w-full bg-base-300'>
							{EMPLOYER_QUESTION_TYPES.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>
								Question <span className='text-primary'>*</span>
							</span>
						</div>
						<textarea
							required
							ref={questionRef}
							rows={3}
							placeholder='e.g. What does the onboarding process look like?'
							className='textarea textarea-bordered w-full bg-base-300'
						/>
					</label>
					<div className='flex justify-end pt-2'>
						<button type='submit' className='btn btn-primary'>
							Add question
						</button>
					</div>
				</form>
			</Modal>
			<button
				type='button'
				className='btn btn-primary btn-sm'
				onClick={() => setIsModalOpen(true)}>
				Add question
			</button>
		</>
	);
};

export default AddEmployerQuestionBtn;

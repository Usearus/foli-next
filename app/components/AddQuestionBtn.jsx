'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import {
	INTERVIEWER_CATEGORIES,
	STAR_ANSWER_TEMPLATE,
} from '../lib/interviewerQuestions';

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
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Type</span>
						</div>
						<select
							value={category}
							onChange={handleCategoryChange}
							className='select select-bordered w-full bg-base-300'>
							{INTERVIEWER_CATEGORIES.map((option) => (
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
							placeholder='e.g. Tell me about a time when...'
							className='textarea textarea-bordered w-full bg-base-300'
						/>
					</label>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Your answer</span>
						</div>
						<textarea
							ref={answerRef}
							defaultValue={STAR_ANSWER_TEMPLATE}
							rows={8}
							placeholder='Your prepared answer (optional)'
							className='textarea textarea-bordered w-full bg-base-300 font-mono text-sm'
						/>
						{category === 'Behavioral (STAR)' ? (
							<p className='label-text-alt pt-1'>
								Use STAR: Situation, Task, Action, Result
							</p>
						) : null}
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
				onClick={() => {
					resetForm();
					setIsModalOpen(true);
				}}>
				Add question
			</button>
		</>
	);
};

export default AddQuestionBtn;

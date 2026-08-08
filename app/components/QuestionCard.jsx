'use client';

import { useState, useContext } from 'react';
import { Pencil1Icon, TrashIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import {
	INTERVIEWER_CATEGORIES,
	STAR_ANSWER_TEMPLATE,
} from '../lib/interviewerQuestions';

const isStarCategory = (category) =>
	category === 'Behavioral (STAR)' || category === '_Behavioral questions';

const QuestionCard = ({ questionItem }) => {
	const { fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isExpanded, setIsExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [question, setQuestion] = useState(questionItem.question || '');
	const [response, setResponse] = useState(questionItem.response || '');
	const [category, setCategory] = useState(
		isStarCategory(questionItem.category)
			? 'Behavioral (STAR)'
			: questionItem.category?.startsWith('_')
				? 'Role & skills'
				: questionItem.category || 'General',
	);

	const handleSave = async () => {
		const trimmedQuestion = question.trim();
		if (!trimmedQuestion) {
			setAlert('Question is required', 'error');
			return;
		}

		const { error } = await supabase
			.from('questions')
			.update({
				question: trimmedQuestion,
				response: response.trim() || null,
				category,
			})
			.eq('id', questionItem.id);

		if (error) {
			setAlert('Unable to update question', 'error');
			console.log(error);
			return;
		}

		fetchUserQuestions();
		setAlert('Question updated', 'success');
		setEditing(false);
	};

	const handleCancel = () => {
		setQuestion(questionItem.question || '');
		setResponse(questionItem.response || '');
		setCategory(
			isStarCategory(questionItem.category)
				? 'Behavioral (STAR)'
				: questionItem.category || 'General',
		);
		setEditing(false);
	};

	const handleDelete = async () => {
		const { error } = await supabase
			.from('questions')
			.delete()
			.eq('id', questionItem.id);

		if (error) {
			setAlert('Unable to delete question', 'error');
			console.log(error);
			return;
		}

		fetchUserQuestions();
		setAlert('Question deleted', 'success');
		setIsDeleteOpen(false);
	};

	const toggleExpanded = () => {
		if (editing) return;
		setIsExpanded((prev) => !prev);
	};

	const startEditing = () => {
		setIsExpanded(true);
		setEditing(true);
	};

	const showStarBadge = isStarCategory(questionItem.category);

	return (
		<div className='bg-base-100 rounded-xl overflow-hidden shadow-sm'>
			<div className='p-5 flex justify-between items-start gap-4'>
				<div className='flex flex-col gap-2 min-w-0 flex-1'>
					<span className='badge badge-neutral badge-sm w-fit'>
						{showStarBadge
							? 'Behavioral (STAR)'
							: questionItem.category || 'General'}
					</span>
					<h3 className='font-semibold text-base leading-snug'>
						{questionItem.question}
					</h3>
				</div>
				<div className='flex items-center gap-1 shrink-0'>
					{isExpanded ? (
						<>
							{!editing ? (
								<button
									type='button'
									className='btn btn-ghost btn-xs btn-square'
									onClick={startEditing}
									aria-label='Edit question'>
									<Pencil1Icon />
								</button>
							) : null}
							<button
								type='button'
								className='btn btn-ghost btn-xs btn-square text-error'
								onClick={() => setIsDeleteOpen(true)}
								aria-label='Delete question'>
								<TrashIcon />
							</button>
						</>
					) : null}
					<button
						type='button'
						className='btn btn-ghost btn-xs btn-square'
						onClick={toggleExpanded}
						disabled={editing}
						aria-label={isExpanded ? 'Collapse question' : 'Expand question'}
						aria-expanded={isExpanded}>
						<ChevronDownIcon
							className={`transition-transform duration-200 ${
								isExpanded ? 'rotate-180' : ''
							}`}
						/>
					</button>
				</div>
			</div>

			{isExpanded ? (
				<div className='px-5 pb-5 flex flex-col gap-3'>
					{editing ? (
						<div className='flex flex-col gap-3'>
							<label className='form-control w-full'>
								<div className='label py-0'>
									<span className='label-text font-semibold'>Type</span>
								</div>
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className='select select-bordered select-sm w-full bg-base-300'>
									{INTERVIEWER_CATEGORIES.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</label>
							<label className='form-control w-full'>
								<div className='label py-0'>
									<span className='label-text font-semibold'>Question</span>
								</div>
								<textarea
									value={question}
									onChange={(e) => setQuestion(e.target.value)}
									rows={3}
									className='textarea textarea-bordered w-full bg-base-300'
								/>
							</label>
							<label className='form-control w-full'>
								<div className='label py-0'>
									<span className='label-text font-semibold'>Your answer</span>
								</div>
								<textarea
									value={response}
									onChange={(e) => setResponse(e.target.value)}
									rows={isStarCategory(category) ? 8 : 5}
									placeholder={
										isStarCategory(category) ? STAR_ANSWER_TEMPLATE : undefined
									}
									className='textarea textarea-bordered w-full bg-base-300 font-mono text-sm'
								/>
							</label>
							<div className='flex justify-end gap-2'>
								<button
									type='button'
									className='btn btn-ghost btn-sm'
									onClick={handleCancel}>
									Cancel
								</button>
								<button
									type='button'
									className='btn btn-primary btn-sm'
									onClick={handleSave}>
									Save
								</button>
							</div>
						</div>
					) : (
						<>
							<div className='divider my-0' />
							<div>
								<p className='text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-1'>
									Your answer
								</p>
								{questionItem.response ? (
									<p className='text-sm whitespace-pre-wrap leading-relaxed font-mono'>
										{questionItem.response}
									</p>
								) : (
									<p className='text-sm italic text-base-content/50'>
										No answer yet — click Edit to draft your response
										{showStarBadge ? ' using STAR' : ''}.
									</p>
								)}
							</div>
						</>
					)}
				</div>
			) : null}

			<Modal
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				title='Delete question'>
				<div className='pb-4'>
					<p>
						Are you sure you want to delete this question? This cannot be undone.
					</p>
				</div>
				<div className='flex justify-end'>
					<button
						type='button'
						className='btn btn-outline btn-error'
						onClick={handleDelete}>
						Confirm
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default QuestionCard;

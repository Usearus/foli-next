'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import EmployerQuestionFilter from './EmployerQuestionFilter';
import {
	isEmployerQuestion,
	getEmployerQuestionType,
	employerCategory,
	EMPLOYER_QUESTION_TYPES,
	EMPLOYER_QUESTION_FILTER_ALL,
	filterEmployerQuestionsByType,
	STARTER_EMPLOYER_QUESTIONS,
} from '../lib/employerQuestions';

const EmployerQuestionRow = ({
	questionItem,
	isSelected,
	onToggle,
	onDeleted,
}) => {
	const { fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [type, setType] = useState(getEmployerQuestionType(questionItem));
	const [question, setQuestion] = useState(questionItem.question || '');

	const openEdit = () => {
		setType(getEmployerQuestionType(questionItem));
		setQuestion(questionItem.question || '');
		setIsEditOpen(true);
	};

	const handleSave = async () => {
		const trimmedQuestion = question.trim();
		if (!trimmedQuestion) {
			setAlert('Question is required', 'error');
			return;
		}

		const { error } = await supabase
			.from('questions')
			.update({
				category: employerCategory(type),
				question: trimmedQuestion,
			})
			.eq('id', questionItem.id);

		if (error) {
			setAlert('Unable to update question', 'error');
			console.log(error);
			return;
		}

		fetchUserQuestions();
		setAlert('Question updated', 'success');
		setIsEditOpen(false);
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

		onDeleted(questionItem.id);
		fetchUserQuestions();
		setAlert('Question deleted', 'success');
		setIsDeleteOpen(false);
	};

	const typeLabel = getEmployerQuestionType(questionItem);

	return (
		<>
			<div className='bg-base-100 rounded-xl p-4 flex items-start gap-3 shadow-sm'>
				<input
					type='checkbox'
					className='checkbox checkbox-primary mt-1'
					checked={isSelected}
					onChange={() => onToggle(questionItem.id)}
					aria-label={`Select question: ${questionItem.question}`}
				/>
				<div className='flex-grow min-w-0'>
					<div className='flex justify-between gap-3 items-start'>
						<span className='badge badge-neutral badge-sm mb-2'>{typeLabel}</span>
						<div className='flex gap-1 shrink-0'>
							<button
								type='button'
								className='btn btn-ghost btn-xs btn-square'
								onClick={openEdit}
								aria-label='Edit question'>
								<Pencil1Icon />
							</button>
							<button
								type='button'
								className='btn btn-ghost btn-xs btn-square text-error'
								onClick={() => setIsDeleteOpen(true)}
								aria-label='Delete question'>
								<TrashIcon />
							</button>
						</div>
					</div>
					<p className='text-sm leading-relaxed'>{questionItem.question}</p>
				</div>
			</div>

			<Modal
				isOpen={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				title='Edit question'>
				<form
					className='flex flex-col gap-4 pb-4'
					onSubmit={(event) => {
						event.preventDefault();
						handleSave();
					}}>
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
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							rows={3}
							className='textarea textarea-bordered w-full bg-base-300'
						/>
					</label>
					<div className='flex justify-end pt-2'>
						<button type='submit' className='btn btn-primary'>
							Save
						</button>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				title='Delete question'>
				<div className='pb-4'>
					<p>Delete this question from your list?</p>
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
		</>
	);
};

const EmployerQuestionList = ({ selectedIds, onToggle, onSelectionChange }) => {
	const { userQuestions, fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [typeFilter, setTypeFilter] = useState(EMPLOYER_QUESTION_FILTER_ALL);

	const employerQuestions = useMemo(
		() => (userQuestions || []).filter(isEmployerQuestion),
		[userQuestions],
	);

	const filterCounts = useMemo(() => {
		const counts = { [EMPLOYER_QUESTION_FILTER_ALL]: employerQuestions.length };
		EMPLOYER_QUESTION_TYPES.forEach((type) => {
			counts[type] = employerQuestions.filter(
				(q) => getEmployerQuestionType(q) === type,
			).length;
		});
		return counts;
	}, [employerQuestions]);

	const filteredQuestions = useMemo(
		() => filterEmployerQuestionsByType(employerQuestions, typeFilter),
		[employerQuestions, typeFilter],
	);

	useEffect(() => {
		const validIds = new Set(employerQuestions.map((q) => q.id));
		const cleaned = selectedIds.filter((id) => validIds.has(id));
		if (cleaned.length !== selectedIds.length) {
			onSelectionChange(cleaned);
		}
	}, [employerQuestions, selectedIds, onSelectionChange]);

	const handleAddStarters = async () => {
		const { error } = await supabase.from('questions').insert(STARTER_EMPLOYER_QUESTIONS);
		if (error) {
			setAlert('Unable to add starter questions', 'error');
			console.log(error);
			return;
		}
		fetchUserQuestions();
		setAlert('Starter questions added', 'success');
	};

	const handleDeleted = (id) => {
		onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
	};

	if (!employerQuestions.length) {
		return (
			<div className='max-w-3xl mx-auto w-full p-8 flex flex-col items-center gap-6 text-center'>
				<div>
					<h2 className='text-lg font-semibold'>Build your list for interviews</h2>
					<p className='text-sm text-base-content/70 mt-2'>
						Check the questions you want, then copy them as a formatted list to paste
						into a job page sheet.
					</p>
				</div>
				<button
					type='button'
					className='btn btn-primary btn-sm'
					onClick={handleAddStarters}>
					Add starter questions
				</button>
			</div>
		);
	}

	return (
		<>
			<EmployerQuestionFilter
				activeFilter={typeFilter}
				onFilterChange={setTypeFilter}
				counts={filterCounts}
			/>
			{filteredQuestions.length === 0 ? (
				<div className='max-w-3xl mx-auto w-full p-8 text-center'>
					<p className='text-sm text-base-content/70'>
						No questions for <span className='font-semibold'>{typeFilter}</span>.
					</p>
				</div>
			) : (
				<div className='max-w-3xl mx-auto w-full p-4 flex flex-col gap-3'>
					{filteredQuestions.map((questionItem) => (
						<EmployerQuestionRow
							key={questionItem.id}
							questionItem={questionItem}
							isSelected={selectedIds.includes(questionItem.id)}
							onToggle={onToggle}
							onDeleted={handleDeleted}
						/>
					))}
				</div>
			)}
		</>
	);
};

export default EmployerQuestionList;

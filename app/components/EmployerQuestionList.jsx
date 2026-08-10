'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import EmployerQuestionFilter from './EmployerQuestionFilter';
import QuestionSearchInput from './QuestionSearchInput';
import {
	isMyQuestion,
	getMyQuestionCategory,
	filterMyQuestionsByCategory,
	filterQuestionsBySearch,
	MY_QUESTION_CATEGORIES,
	MY_QUESTION_FILTER_ALL,
	QUESTION_TYPE_MY_QUESTION,
} from '../lib/questions';

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
	const [category, setCategory] = useState(getMyQuestionCategory(questionItem));
	const [question, setQuestion] = useState(questionItem.question || '');

	const openEdit = () => {
		setCategory(getMyQuestionCategory(questionItem));
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
				type: QUESTION_TYPE_MY_QUESTION,
				category,
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

	return (
		<>
			<div className='bg-base-100 rounded-xl p-4 flex items-start gap-3 shadow-sm'>
				<input
					type='checkbox'
					className='checkbox checkbox-secondary mt-1'
					checked={isSelected}
					onChange={() => onToggle(questionItem.id)}
					aria-label={`Select question: ${questionItem.question}`}
				/>
				<div className='grow min-w-0 flex justify-between items-start gap-4'>
					<h3 className='font-semibold text-base leading-snug'>
						{questionItem.question}
					</h3>
					<div className='flex gap-1 shrink-0'>
						<button
							type='button'
							className='btn btn-ghost btn-square'
							onClick={openEdit}
							aria-label='Edit question'>
							<Pencil1Icon />
						</button>
						<button
							type='button'
							className='btn btn-ghost btn-square text-error'
							onClick={() => setIsDeleteOpen(true)}
							aria-label='Delete question'>
							<TrashIcon />
						</button>
					</div>
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
					<fieldset className='fieldset'>
						<label className='label' htmlFor='edit-employer-question-category'>
							Category
						</label>
						<select
							id='edit-employer-question-category'
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
						<label className='label' htmlFor='edit-employer-question-text'>
							Question <span className='text-primary'>*</span>
						</label>
						<textarea
							id='edit-employer-question-text'
							required
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							rows={3}
							className='textarea w-full bg-base-200'
						/>
					</fieldset>
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
	const { userQuestions } = useContext(DatabaseContext);
	const [categoryFilter, setCategoryFilter] = useState(MY_QUESTION_FILTER_ALL);
	const [searchQuery, setSearchQuery] = useState('');

	const myQuestions = useMemo(
		() => (userQuestions || []).filter(isMyQuestion),
		[userQuestions],
	);

	const filterCounts = useMemo(() => {
		const counts = { [MY_QUESTION_FILTER_ALL]: myQuestions.length };
		MY_QUESTION_CATEGORIES.forEach((category) => {
			counts[category] = myQuestions.filter(
				(q) => getMyQuestionCategory(q) === category,
			).length;
		});
		return counts;
	}, [myQuestions]);

	const filteredQuestions = useMemo(() => {
		const byCategory = filterMyQuestionsByCategory(myQuestions, categoryFilter);
		return filterQuestionsBySearch(byCategory, searchQuery);
	}, [myQuestions, categoryFilter, searchQuery]);

	useEffect(() => {
		const validIds = new Set(myQuestions.map((q) => q.id));
		const cleaned = selectedIds.filter((id) => validIds.has(id));
		if (cleaned.length !== selectedIds.length) {
			onSelectionChange(cleaned);
		}
	}, [myQuestions, selectedIds, onSelectionChange]);

	const handleDeleted = (id) => {
		onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
	};

	if (!myQuestions.length) {
		return (
			<div className='max-w-3xl mx-auto w-full p-8 flex flex-col items-center gap-4 text-center'>
				<div>
					<h2 className='text-lg font-semibold'>
						Build your list for interviews
					</h2>
					<p className='text-sm text-base-content/70 mt-2'>
						Add questions with the button above, then copy selected ones into a
						job page sheet.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-3xl mx-auto w-full px-4 pt-4 flex flex-col gap-3'>
			<div className='flex items-center justify-between gap-3'>
				<EmployerQuestionFilter
					activeFilter={categoryFilter}
					onFilterChange={setCategoryFilter}
					counts={filterCounts}
				/>
				<QuestionSearchInput
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder='Search questions'
					className='w-62.5! shrink-0'
				/>
			</div>
			{filteredQuestions.length === 0 ? (
				<div className='py-8 text-center'>
					<p className='text-sm text-base-content/70'>
						{searchQuery.trim()
							? `No questions match "${searchQuery.trim()}"${
									categoryFilter !== MY_QUESTION_FILTER_ALL
										? ` in ${categoryFilter}`
										: ''
								}.`
							: `No questions for ${categoryFilter}.`}
					</p>
				</div>
			) : (
				<div className='flex flex-col gap-3 pb-4'>
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
		</div>
	);
};

export default EmployerQuestionList;

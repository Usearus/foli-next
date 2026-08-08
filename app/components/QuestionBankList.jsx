'use client';

import { useContext, useMemo } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import { supabase } from '../api/supabase';
import QuestionCard from './QuestionCard';
import {
	isInterviewerQuestion,
	STARTER_INTERVIEWER_QUESTIONS,
} from '../lib/interviewerQuestions';

const QuestionBankList = () => {
	const { userQuestions, fetchUserQuestions } = useContext(DatabaseContext);
	const { setAlert } = useAlert();

	const interviewerQuestions = useMemo(
		() => (userQuestions || []).filter(isInterviewerQuestion),
		[userQuestions],
	);

	const handleAddStarters = async () => {
		const { error } = await supabase
			.from('questions')
			.insert(STARTER_INTERVIEWER_QUESTIONS);

		if (error) {
			setAlert('Unable to add starter questions', 'error');
			console.log(error);
			return;
		}

		fetchUserQuestions();
		setAlert('Starter questions added', 'success');
	};

	if (!interviewerQuestions.length) {
		return (
			<div className='max-w-3xl mx-auto w-full p-8 flex flex-col items-center gap-6 text-center'>
				<div>
					<h2 className='text-lg font-semibold'>
						Start practicing interview answers
					</h2>
					<p className='text-sm text-base-content/70 mt-2'>
						Build your bank of behavioral STAR responses and general answers to
						common interviewer questions.
					</p>
				</div>
				<div className='flex flex-wrap gap-2 justify-center'>
					<button
						type='button'
						className='btn btn-primary btn-sm'
						onClick={handleAddStarters}>
						Add starter questions
					</button>
				</div>
				<p className='text-xs text-base-content/50'>
					Includes 5 &ldquo;Tell me about a time when&hellip;&rdquo; STAR
					prompts plus role and general questions.
				</p>
			</div>
		);
	}

	const starQuestions = interviewerQuestions.filter(
		(q) =>
			q.category === 'Behavioral (STAR)' ||
			q.category === '_Behavioral questions',
	);
	const otherQuestions = interviewerQuestions.filter(
		(q) =>
			q.category !== 'Behavioral (STAR)' &&
			q.category !== '_Behavioral questions',
	);

	return (
		<div className='max-w-3xl mx-auto w-full p-4 flex flex-col gap-6'>
			{starQuestions.length > 0 ? (
				<section className='flex flex-col gap-3'>
					<h2 className='text-sm font-semibold uppercase tracking-wide text-base-content/60'>
						Behavioral — STAR format
					</h2>
					{starQuestions.map((questionItem) => (
						<QuestionCard key={questionItem.id} questionItem={questionItem} />
					))}
				</section>
			) : null}

			{otherQuestions.length > 0 ? (
				<section className='flex flex-col gap-3'>
					<h2 className='text-sm font-semibold uppercase tracking-wide text-base-content/60'>
						Role & general
					</h2>
					{otherQuestions.map((questionItem) => (
						<QuestionCard key={questionItem.id} questionItem={questionItem} />
					))}
				</section>
			) : null}
		</div>
	);
};

export default QuestionBankList;

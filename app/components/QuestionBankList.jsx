'use client';

import { useContext, useMemo, useState } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import QuestionCard from './QuestionCard';
import QuestionSearchInput from './QuestionSearchInput';
import {
	isPracticeQuestion,
	PRACTICE_CATEGORIES,
	filterQuestionsBySearch,
} from '../lib/questions';

const PRACTICE_SECTION_TITLES = {
	'Behavioral (STAR)': 'Behavioral — STAR format',
	'Role & skills': 'Role & skills',
	General: 'General',
};

function getPracticeSectionCategory(questionItem) {
	const category = questionItem.category || 'General';
	if (category === 'Behavioral (STAR)' || category === 'Role & skills') {
		return category;
	}
	return 'General';
}

const QuestionBankList = () => {
	const { userQuestions } = useContext(DatabaseContext);
	const [searchQuery, setSearchQuery] = useState('');

	const practiceQuestions = useMemo(
		() => (userQuestions || []).filter(isPracticeQuestion),
		[userQuestions],
	);

	const searchedQuestions = useMemo(
		() => filterQuestionsBySearch(practiceQuestions, searchQuery),
		[practiceQuestions, searchQuery],
	);

	if (!practiceQuestions.length) {
		return (
			<div className='max-w-3xl mx-auto w-full p-8 flex flex-col items-center gap-4 text-center'>
				<div>
					<h2 className='text-lg font-semibold'>
						Start practicing interview answers
					</h2>
					<p className='text-sm text-base-content/70 mt-2'>
						Add questions with the button above. Everything you add is saved to
						your database.
					</p>
				</div>
			</div>
		);
	}

	const questionsBySection = useMemo(() => {
		const grouped = Object.fromEntries(
			PRACTICE_CATEGORIES.map((category) => [category, []]),
		);

		searchedQuestions.forEach((questionItem) => {
			const section = getPracticeSectionCategory(questionItem);
			grouped[section].push(questionItem);
		});

		for (const category of PRACTICE_CATEGORIES) {
			grouped[category].sort((a, b) =>
				(a.question || '').localeCompare(b.question || '', undefined, {
					sensitivity: 'base',
				}),
			);
		}

		return grouped;
	}, [searchedQuestions]);

	const hasSearchResults = searchedQuestions.length > 0;

	return (
		<div className='max-w-3xl mx-auto w-full p-4 flex flex-col gap-6'>
			<QuestionSearchInput
				value={searchQuery}
				onChange={setSearchQuery}
				placeholder='Search questions and answers'
			/>

			{searchQuery.trim() && !hasSearchResults ? (
				<p className='text-sm text-base-content/70 text-center py-4'>
					No questions match &ldquo;{searchQuery.trim()}&rdquo;.
				</p>
			) : (
				PRACTICE_CATEGORIES.map((category) => {
					const sectionQuestions = questionsBySection[category];
					if (!sectionQuestions.length) return null;

					return (
						<section key={category} className='flex flex-col gap-3'>
							<h2 className='text-sm font-semibold uppercase tracking-wide text-base-content/60'>
								{PRACTICE_SECTION_TITLES[category]}
							</h2>
							{sectionQuestions.map((questionItem) => (
								<QuestionCard key={questionItem.id} questionItem={questionItem} />
							))}
						</section>
					);
				})
			)}
		</div>
	);
};

export default QuestionBankList;

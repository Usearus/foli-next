'use client';

import { useContext } from 'react';
import { DatabaseContext } from '../../context/DatabaseContext';
import ContentLoader from '../../components/ContentLoader';
import TopBarQuestions from '../../components/TopBarQuestions';
import QuestionBankList from '../../components/QuestionBankList';

const PracticePage = () => {
	const { isQuestionsLoading } = useContext(DatabaseContext);

	return (
		<div className='flex flex-col h-full text-base-content'>
			<TopBarQuestions />
			<div className='flex-grow overflow-y-auto flex flex-col'>
				{isQuestionsLoading ? <ContentLoader /> : <QuestionBankList />}
			</div>
		</div>
	);
};

export default PracticePage;

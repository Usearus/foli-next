'use client';

import { useContext, useCallback, useMemo, useState } from 'react';
import { DatabaseContext } from '../../context/DatabaseContext';
import useAlert from '../../alerts/useAlert';
import ContentLoader from '../../components/ContentLoader';
import TopBarMyQuestions from '../../components/TopBarMyQuestions';
import EmployerQuestionList from '../../components/EmployerQuestionList';
import {
	copyMyQuestionsToClipboard,
	isMyQuestion,
} from '../../lib/questions';

const MyQuestionsPage = () => {
	const { userQuestions, isQuestionsLoading } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [selectedIds, setSelectedIds] = useState([]);

	const handleSelectionChange = useCallback((ids) => {
		setSelectedIds(ids);
	}, []);

	const handleToggle = useCallback(
		(id) => {
			handleSelectionChange(
				selectedIds.includes(id)
					? selectedIds.filter((itemId) => itemId !== id)
					: [...selectedIds, id],
			);
		},
		[selectedIds, handleSelectionChange],
	);

	const employerQuestions = useMemo(
		() => (userQuestions || []).filter(isMyQuestion),
		[userQuestions],
	);

	const selectedQuestions = useMemo(
		() => employerQuestions.filter((q) => selectedIds.includes(q.id)),
		[employerQuestions, selectedIds],
	);

	const handleCopySelected = async () => {
		if (!selectedQuestions.length) {
			setAlert('Select at least one question', 'warning');
			return;
		}

		try {
			await copyMyQuestionsToClipboard(selectedQuestions);
			setAlert('Copied — paste into a job page sheet', 'success');
		} catch (error) {
			console.log(error);
			setAlert('Unable to copy to clipboard', 'error');
		}
	};

	return (
		<div className='flex flex-col h-full text-base-content'>
			<TopBarMyQuestions
				selectedCount={selectedQuestions.length}
				onCopySelected={handleCopySelected}
				onClearSelection={() => handleSelectionChange([])}
			/>
			<div className='flex-grow overflow-y-auto flex flex-col'>
				{isQuestionsLoading ? (
					<ContentLoader />
				) : (
					<EmployerQuestionList
						selectedIds={selectedIds}
						onToggle={handleToggle}
						onSelectionChange={handleSelectionChange}
					/>
				)}
			</div>
		</div>
	);
};

export default MyQuestionsPage;

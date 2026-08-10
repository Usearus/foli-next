'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { useAddPage } from '../hooks/useAddPage';
import TemplateSidePanel from './TemplateSidePanel';
import AiAssistModal from './AiAssistModal';

const AddPageDropdown = () => {
	const {
		isTemplatePanelOpen,
		setIsTemplatePanelOpen,
		openTemplatePanel,
		openAiModal,
		isAiModalOpen,
		setIsAiModalOpen,
		handleCreateAiPage,
		currentJob,
		addBlankPage,
	} = useAddPage();

	return (
		<>
			<TemplateSidePanel
				isOpen={isTemplatePanelOpen}
				onClose={() => setIsTemplatePanelOpen(false)}
			/>
			<AiAssistModal
				isOpen={isAiModalOpen}
				onClose={() => setIsAiModalOpen(false)}
				mode='create'
				jobId={currentJob?.id}
				onCreatePage={handleCreateAiPage}
			/>
			<div className='dropdown dropdown-bottom dropdown-end'>
				<div tabIndex={0} role='button' className='btn btn-primary rounded-full m-1'>
					<PlusIcon className='size-4 shrink-0' />
					Add page
				</div>
				<ul
					tabIndex={0}
					className='dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow'>
					<li>
						<button type='button' onClick={addBlankPage}>
							Blank page
						</button>
					</li>
					<li>
						<button type='button' onClick={openTemplatePanel}>
							Use template
						</button>
					</li>
					<li>
						<button type='button' onClick={openAiModal}>
							Use AI assistant
						</button>
					</li>
				</ul>
			</div>
		</>
	);
};

export default AddPageDropdown;

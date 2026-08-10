'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { useAddPage } from '../hooks/useAddPage';
import AddPageModal from './AddPageModal';
import TemplateSidePanel from './TemplateSidePanel';

const AddPageDropdown = () => {
	const {
		isModalOpen,
		setIsModalOpen,
		isTemplatePanelOpen,
		setIsTemplatePanelOpen,
		validated,
		titleRef,
		titleMaxChar,
		handleSubmit,
		openBlankPageModal,
		openTemplatePanel,
	} = useAddPage();

	return (
		<>
			<AddPageModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				validated={validated}
				titleRef={titleRef}
				titleMaxChar={titleMaxChar}
				onSubmit={handleSubmit}
			/>
			<TemplateSidePanel
				isOpen={isTemplatePanelOpen}
				onClose={() => setIsTemplatePanelOpen(false)}
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
						<button type='button' onClick={openBlankPageModal}>
							Blank page
						</button>
					</li>
					<li>
						<button type='button' onClick={openTemplatePanel}>
							Use template
						</button>
					</li>
					<li className='disabled'>
						<button type='button'>Use AI assistant</button>
					</li>
				</ul>
			</div>
		</>
	);
};

export default AddPageDropdown;

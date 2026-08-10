'use client';

import { useState } from 'react';
import { MagicWandIcon } from '@radix-ui/react-icons';
import AiAssistModal from './AiAssistModal';

const AiAssistBtn = ({ pageId, templateId, jobId, onApply, className = '' }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<div className='ai-assist-aura'>
				<button
					type='button'
					className={`btn btn-ghost relative z-1 ${className}`.trim()}
					onClick={() => setIsModalOpen(true)}
					aria-label='Ask AI'>
					<MagicWandIcon />
				</button>
			</div>

			<AiAssistModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				mode='edit'
				pageId={pageId}
				templateId={templateId}
				jobId={jobId}
				onApply={onApply}
			/>
		</>
	);
};

export default AiAssistBtn;

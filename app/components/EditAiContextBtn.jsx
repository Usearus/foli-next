'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';

const AI_CONTEXT_MAX_CHAR = 10000;

const EditAiContextBtn = () => {
	const { userProfile, fetchUserProfile } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [characterCount, setCharacterCount] = useState(0);
	const aiContextRef = useRef(null);

	const initialValue = userProfile?.ai_context ?? '';

	useEffect(() => {
		if (!isModalOpen || !aiContextRef.current) {
			return;
		}

		aiContextRef.current.value = initialValue;
		setCharacterCount(initialValue.length);
	}, [isModalOpen, initialValue]);

	const handleClose = () => {
		setIsModalOpen(false);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const ai_context = aiContextRef.current?.value ?? '';

		const { error } = await supabase
			.from('profiles')
			.update({ ai_context })
			.eq('id', userProfile.id);

		if (error) {
			setAlert('Unable to update AI context', 'error');
			console.log(error);
			return;
		}

		await fetchUserProfile();
		setAlert('AI context updated', 'success');
		handleClose();
	};

	return (
		<>
			<button
				type='button'
				className='btn btn-ghost'
				onClick={() => setIsModalOpen(true)}
				aria-label='Edit AI context'>
				<Pencil1Icon />
			</button>

			<Modal isOpen={isModalOpen} onClose={handleClose} title='Edit AI context'>
				<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
					<p className='text-sm text-base-content/70'>
						Background the AI can reference when helping edit pages — tone,
						strengths, career story, and what to emphasize or avoid.
					</p>
					<fieldset className='fieldset'>
						<div className='flex justify-between items-center'>
							<label className='label' htmlFor='edit-ai-context'>
								AI context
							</label>
							<span className='label text-base-content/60'>
								{characterCount}/{AI_CONTEXT_MAX_CHAR}
							</span>
						</div>
						<textarea
							id='edit-ai-context'
							ref={aiContextRef}
							className='textarea textarea-bordered w-full min-h-48 bg-base-200'
							maxLength={AI_CONTEXT_MAX_CHAR}
							onChange={(event) => setCharacterCount(event.target.value.length)}
							placeholder='Example: Senior product designer targeting staff-level IC roles. Emphasize systems thinking, 0→1 work, and cross-functional leadership. Keep tone concise and confident — avoid buzzwords.'
						/>
					</fieldset>
					<div className='flex justify-end'>
						<button type='submit' className='btn btn-primary'>
							Save
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export default EditAiContextBtn;

'use client';

import Modal from './Modal';

const AddPageModal = ({
	isOpen,
	onClose,
	validated,
	titleRef,
	titleMaxChar,
	onSubmit,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Add page'>
			<div className='pb-4 flex flex-col gap-4'>
				<form
					className={validated ? 'was-validated' : ''}
					onSubmit={onSubmit}
					noValidate>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-page-title'>
							Title <span className='text-primary'>*</span>
						</label>
						<input
							id='add-page-title'
							type='text'
							required
							ref={titleRef}
							maxLength={titleMaxChar}
							className='input w-full bg-base-200'
						/>
					</fieldset>
					<div className='flex justify-end pt-6'>
						<button type='submit' className='btn btn-primary'>
							Confirm
						</button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default AddPageModal;

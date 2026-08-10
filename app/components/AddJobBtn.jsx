'use client';

import { useState, useContext, useRef } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { DEFAULT_USER } from '../config/user';
import useAlert from '../alerts/useAlert';
import { PlusIcon } from '@radix-ui/react-icons';
import Modal from './Modal';
import { supabase } from '../api/supabase';

const AddJobBtn = () => {
	const { fetchUserJobs, setCreatedJobID } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [validated, setValidated] = useState(false);

	const companyRef = useRef(null);
	const positionRef = useRef(null);
	const salaryMinRef = useRef(null);
	const salaryMaxRef = useRef(null);
	const locationRef = useRef(null);
	const remoteRef = useRef(null);
	const linkRef = useRef(null);

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		if (form.checkValidity() === true) {
			setValidated(false);
			handleAddJobClick();
		} else {
			setValidated(true);
		}
	};

	const handleAddJobClick = async () => {
		let salary_min = salaryMinRef.current.value.trim();
		let salary_max = salaryMaxRef.current.value.trim();

		if (salary_min === '') {
			salary_min = null;
		} else {
			salary_min = parseInt(salary_min, 10);
		}

		if (salary_max === '') {
			salary_max = null;
		} else {
			salary_max = parseInt(salary_max, 10);
		}

		const { data, error } = await supabase
			.from('jobs')
			.insert({
				account: DEFAULT_USER.email,
				company: companyRef.current.value,
				position: positionRef.current.value,
				salary_min,
				salary_max,
				location: locationRef.current.value,
				remote: remoteRef.current.checked,
				link: linkRef.current.value,
				status: 'Interested',
				edited: new Date().toLocaleDateString('en-US'),
			})
			.select();

		if (error) {
			setAlert('Unable to add job', 'error');
			return;
		}

		fetchUserJobs();
		setAlert('Job added', 'success');
		const newJobId = data[0].id;
		await supabase.from('pages').insert({
			title: 'Job Description',
			account: DEFAULT_USER.email,
			jobid: newJobId,
			locked: true,
			position: 0,
		});
		setCreatedJobID(newJobId);
		setIsModalOpen(false);
	};

	return (
		<>
			<button
				type='button'
				className='btn btn-primary rounded-full'
				onClick={() => setIsModalOpen(true)}>
				<PlusIcon className='size-4 shrink-0' />
				Add application
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Add application'>
				<form
					className={`flex flex-col gap-4 ${validated ? 'was-validated' : ''}`}
					onSubmit={handleSubmit}
					noValidate>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-job-company'>
							Company <span className='text-primary'>*</span>
						</label>
						<input
							id='add-job-company'
							type='text'
							required
							className='input w-full bg-base-200'
							ref={companyRef}
						/>
					</fieldset>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-job-position'>
							Position <span className='text-primary'>*</span>
						</label>
						<input
							id='add-job-position'
							type='text'
							required
							className='input w-full bg-base-200'
							ref={positionRef}
						/>
					</fieldset>
					<div className='flex gap-4'>
						<fieldset className='fieldset w-full'>
							<label className='label' htmlFor='add-job-salary-min'>
								Salary minimum ($)
							</label>
							<input
								id='add-job-salary-min'
								type='number'
								className='input w-full bg-base-200'
								placeholder='0'
								ref={salaryMinRef}
								max='9999999'
							/>
						</fieldset>
						<fieldset className='fieldset w-full'>
							<label className='label' htmlFor='add-job-salary-max'>
								Salary maximum ($)
							</label>
							<input
								id='add-job-salary-max'
								type='number'
								className='input w-full bg-base-200'
								placeholder='0'
								ref={salaryMaxRef}
								max='9999999'
							/>
						</fieldset>
					</div>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-job-location'>
							Location
						</label>
						<input
							id='add-job-location'
							type='text'
							className='input w-full bg-base-200'
							ref={locationRef}
						/>
					</fieldset>
					<fieldset className='fieldset'>
						<label className='label cursor-pointer justify-start gap-3'>
							<input
								type='checkbox'
								className='checkbox bg-base-200'
								ref={remoteRef}
							/>
							Remote / hybrid
						</label>
					</fieldset>
					<fieldset className='fieldset'>
						<label className='label' htmlFor='add-job-link'>
							Listing URL
						</label>
						<input
							id='add-job-link'
							type='text'
							className='input w-full bg-base-200'
							ref={linkRef}
						/>
					</fieldset>
					<div className='flex justify-end pt-6'>
						<button type='submit' className='btn btn-primary'>
							Confirm
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
};

export default AddJobBtn;

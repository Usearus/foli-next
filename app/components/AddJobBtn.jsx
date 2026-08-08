'use client';

import { useState, useContext, useRef } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { DEFAULT_USER } from '../config/user';
import useAlert from '../alerts/useAlert';
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
		});
		setCreatedJobID(newJobId);
		setIsModalOpen(false);
	};

	return (
		<>
			<button
				type='button'
				className='btn btn-primary btn-sm'
				onClick={() => setIsModalOpen(true)}>
				Add job
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title='Add job'>
				<form
					className={`flex flex-col gap-2 ${validated ? 'was-validated' : ''}`}
					onSubmit={handleSubmit}
					noValidate>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>
								Company <span className='text-primary'>*</span>
							</span>
						</div>
						<input
							type='text'
							required
							className='input input-bordered w-full bg-base-300'
							ref={companyRef}
						/>
					</label>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>
								Position <span className='text-primary'>*</span>
							</span>
						</div>
						<input
							type='text'
							required
							className='input input-bordered w-full bg-base-300'
							ref={positionRef}
						/>
					</label>
					<div className='flex gap-6'>
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Salary minimum ($)</span>
							</div>
							<input
								type='number'
								className='input input-bordered w-full bg-base-300'
								placeholder='0'
								ref={salaryMinRef}
								max='9999999'
							/>
						</label>
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Salary maximum ($)</span>
							</div>
							<input
								type='number'
								className='input input-bordered w-full bg-base-300'
								placeholder='0'
								ref={salaryMaxRef}
								max='9999999'
							/>
						</label>
					</div>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Location</span>
						</div>
						<input
							type='text'
							className='input input-bordered w-full bg-base-300'
							ref={locationRef}
						/>
					</label>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Remote / hybrid</span>
						</div>
						<input
							type='checkbox'
							className='checkbox bg-base-300'
							ref={remoteRef}
						/>
					</label>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Listing URL</span>
						</div>
						<input
							type='text'
							className='input input-bordered w-full bg-base-300'
							ref={linkRef}
						/>
					</label>
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

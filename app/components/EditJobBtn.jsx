'use client';

import { useState, useContext, useRef } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';

const EditJobBtn = ({ job, label = 'Edit job' }) => {
	const { fetchUserJobs, fetchUserJobsClosed, fetchCurrentJob, currentJob } =
		useContext(DatabaseContext);
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

	const initialValues = {
		company: job?.company ?? '',
		position: job?.position ?? '',
		salary_min: job?.salary_min ?? '',
		salary_max: job?.salary_max ?? '',
		location: job?.location ?? '',
		remote: job?.remote ?? false,
		link: job?.link ?? '',
	};

	const resetForm = () => {
		if (!companyRef.current) return;
		companyRef.current.value = initialValues.company;
		positionRef.current.value = initialValues.position;
		salaryMinRef.current.value = initialValues.salary_min;
		salaryMaxRef.current.value = initialValues.salary_max;
		locationRef.current.value = initialValues.location;
		remoteRef.current.checked = initialValues.remote;
		linkRef.current.value = initialValues.link;
	};

	const handleOpenClick = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsModalOpen(true);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		if (form.checkValidity() === true) {
			setValidated(false);
			handleEditJobClick();
		} else {
			setValidated(true);
		}
	};

	const handleEditJobClick = async () => {
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

		const { error } = await supabase
			.from('jobs')
			.update({
				company: companyRef.current.value,
				position: positionRef.current.value,
				salary_min,
				salary_max,
				location: locationRef.current.value,
				remote: remoteRef.current.checked,
				link: linkRef.current.value,
				edited: new Date().toLocaleDateString('en-US'),
			})
			.eq('id', job.id);

		if (error) {
			setAlert('Unable to update job', 'error');
			console.log(error);
			return;
		}

		await Promise.all([fetchUserJobs(), fetchUserJobsClosed()]);
		if (currentJob?.id === job.id) {
			await fetchCurrentJob(currentJob);
		}
		setAlert('Job updated', 'success');
		setIsModalOpen(false);
	};

	const handleCancelClick = () => {
		resetForm();
		setIsModalOpen(false);
	};

	return (
		<>
			<button type='button' className='text-sm text-left w-full' onClick={handleOpenClick}>
				{label}
			</button>

			<Modal isOpen={isModalOpen} onClose={handleCancelClick} title='Edit job'>
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
							defaultValue={initialValues.company}
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
							defaultValue={initialValues.position}
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
								defaultValue={initialValues.salary_min}
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
								defaultValue={initialValues.salary_max}
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
							defaultValue={initialValues.location}
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
							defaultChecked={initialValues.remote}
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
							defaultValue={initialValues.link}
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

export default EditJobBtn;

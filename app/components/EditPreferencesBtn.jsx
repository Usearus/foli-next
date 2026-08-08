'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import useAlert from '../alerts/useAlert';
import Modal from './Modal';
import { supabase } from '../api/supabase';
import { Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons';

const EditPreferencesBtn = () => {
	const { userProfile, fetchUserProfile } = useContext(DatabaseContext);
	const { setAlert } = useAlert();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [validated, setValidated] = useState(false);
	const [locationInput, setLocationInput] = useState('');
	const [tempLocations, setTempLocations] = useState([]);

	const positionRef = useRef(null);
	const salaryCurrentRef = useRef(null);
	const salaryTargetRef = useRef(null);
	const remoteRef = useRef(null);

	const initialValues = {
		position: userProfile?.position ?? '',
		salary_current: userProfile?.salary_current ?? '',
		salary_target: userProfile?.salary_target ?? '',
		location_preference: userProfile?.location_preference ?? [],
		location_remote: userProfile?.location_remote ?? false,
	};

	useEffect(() => {
		if (userProfile) {
			setTempLocations(userProfile.location_preference ?? []);
		}
	}, [userProfile]);

	const handleCancelClick = () => {
		if (positionRef.current) positionRef.current.value = initialValues.position;
		if (salaryCurrentRef.current) {
			salaryCurrentRef.current.value = initialValues.salary_current;
		}
		if (salaryTargetRef.current) {
			salaryTargetRef.current.value = initialValues.salary_target;
		}
		if (remoteRef.current) {
			remoteRef.current.checked = initialValues.location_remote;
		}
		setTempLocations(userProfile?.location_preference ?? []);
		setLocationInput('');
		setIsModalOpen(false);
	};

	const handleAddLocation = () => {
		const newLocation = locationInput.trim();
		if (newLocation !== '' && !tempLocations.includes(newLocation)) {
			setTempLocations([...tempLocations, newLocation]);
			setLocationInput('');
		}
	};

	const handleRemoveLocation = (location) => {
		setTempLocations(tempLocations.filter((loc) => loc !== location));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const form = event.currentTarget;
		if (form.checkValidity() === true) {
			setValidated(false);
			handlePreferencesClick();
		} else {
			setValidated(true);
		}
	};

	const handlePreferencesClick = async () => {
		const { error } = await supabase
			.from('profiles')
			.update({
				position: positionRef.current.value,
				salary_current: salaryCurrentRef.current.value * 1,
				salary_target: salaryTargetRef.current.value * 1,
				location_preference: tempLocations,
				location_remote: remoteRef.current.checked,
			})
			.eq('id', userProfile.id);

		if (error) {
			setAlert('Unable to update job preferences', 'error');
			console.log('error is', error);
			return;
		}

		await fetchUserProfile();
		setIsModalOpen(false);
		setAlert('Job preferences updated', 'success');
	};

	return (
		<>
			<button
				type='button'
				className='btn btn-ghost btn-sm'
				onClick={() => setIsModalOpen(true)}>
				<Pencil1Icon />
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCancelClick}
				title='Edit job preferences'>
				<form
					className={`flex flex-col gap-6 ${validated ? 'was-validated' : ''}`}
					onSubmit={handleSubmit}
					noValidate>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Position title</span>
						</div>
						<input
							type='text'
							className='input input-bordered w-full bg-base-300'
							ref={positionRef}
							defaultValue={initialValues.position}
						/>
					</label>

					<div className='flex gap-4'>
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Current salary ($)</span>
							</div>
							<input
								type='number'
								className='input input-bordered w-full bg-base-300'
								placeholder='0'
								ref={salaryCurrentRef}
								defaultValue={initialValues.salary_current}
								max='9999999'
							/>
						</label>
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Target salary ($)</span>
							</div>
							<input
								type='number'
								className='input input-bordered w-full bg-base-300'
								placeholder='0'
								ref={salaryTargetRef}
								defaultValue={initialValues.salary_target}
								max='9999999'
							/>
						</label>
					</div>

					<div className='flex flex-col gap-2'>
						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Location</span>
							</div>
							<div className='flex gap-2'>
								<input
									type='text'
									className='input input-bordered w-full bg-base-300'
									placeholder='ex: New York City, NY'
									value={locationInput}
									onChange={(e) => setLocationInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddLocation();
										}
									}}
								/>
								<button
									type='button'
									className='btn btn-primary'
									onClick={handleAddLocation}
									disabled={!locationInput.trim()}>
									Add location
								</button>
							</div>
							<div className='flex mt-1 mb-2 gap-1 flex-wrap'>
								{tempLocations.map((location) => (
									<div
										key={location}
										className='badge badge-neutral gap-2 mt-2'>
										{location}
										<Cross2Icon
											onClick={() => handleRemoveLocation(location)}
											className='cursor-pointer'
										/>
									</div>
								))}
							</div>
						</label>

						<label className='form-control w-full'>
							<div className='label'>
								<span className='label-text'>Remote / hybrid</span>
							</div>
							<input
								type='checkbox'
								className='checkbox bg-base-300'
								ref={remoteRef}
								defaultChecked={initialValues.location_remote}
							/>
						</label>
					</div>

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

export default EditPreferencesBtn;

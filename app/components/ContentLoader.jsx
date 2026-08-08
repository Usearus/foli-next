import Loader from './Loader';

const ContentLoader = ({ className = '' }) => {
	return (
		<div
			className={`flex flex-col justify-center items-center flex-grow w-full p-8 ${className}`}>
			<Loader />
		</div>
	);
};

export default ContentLoader;

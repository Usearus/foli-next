'use client';

import { useCallback, useContext, useEffect, useRef, useState, createRef } from 'react';
import SinglePage from './SinglePage';
import { DatabaseContext } from '../context/DatabaseContext';

const PAGE_LIST_END_SPACER_PX = 600;

const PageList = () => {
	const { currentPages, selectedPageID, scrollPageListToEndRequest } =
		useContext(DatabaseContext);
	const visiblePages = currentPages.filter((page) => page.visible);

	const pageRef = useRef([]);
	const prevLengthRef = useRef(currentPages.length);
	const listRef = useRef(null);
	const lastScrollToEndRequestRef = useRef(0);
	const [showLeftFade, setShowLeftFade] = useState(false);

	const updateLeftFade = useCallback(() => {
		const listEl = listRef.current;
		if (!listEl) {
			return;
		}

		setShowLeftFade(listEl.scrollLeft > 4);
	}, []);

	const scrollListToEnd = useCallback((behavior = 'smooth') => {
		const listEl = listRef.current;
		if (!listEl) {
			return;
		}

		listEl.scrollTo({
			left: listEl.scrollWidth - listEl.clientWidth,
			behavior,
		});
	}, []);

	useEffect(() => {
		const listEl = listRef.current;
		if (!listEl) return;

		const syncMaxHeight = () => {
			listEl.style.setProperty(
				'--page-list-height',
				`${listEl.clientHeight}px`,
			);
		};

		syncMaxHeight();

		const observer = new ResizeObserver(syncMaxHeight);
		observer.observe(listEl);

		return () => observer.disconnect();
	}, [visiblePages.length]);

	useEffect(() => {
		const listEl = listRef.current;
		if (!listEl) {
			return;
		}

		updateLeftFade();

		listEl.addEventListener('scroll', updateLeftFade, { passive: true });
		window.addEventListener('resize', updateLeftFade);

		return () => {
			listEl.removeEventListener('scroll', updateLeftFade);
			window.removeEventListener('resize', updateLeftFade);
		};
	}, [visiblePages.length, updateLeftFade]);

	useEffect(() => {
		updateLeftFade();
	}, [scrollPageListToEndRequest, selectedPageID, updateLeftFade]);

	useEffect(() => {
		if (!scrollPageListToEndRequest) {
			return;
		}

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				scrollListToEnd('smooth');
			});
		});
	}, [scrollPageListToEndRequest, visiblePages.length, scrollListToEnd]);

	useEffect(() => {
		if (
			scrollPageListToEndRequest > lastScrollToEndRequestRef.current
		) {
			lastScrollToEndRequestRef.current = scrollPageListToEndRequest;
			prevLengthRef.current = currentPages.length;
			return;
		}

		const pageToScrollTo = pageRef.current.find(
			(page) => page.id === selectedPageID,
		);
		if (pageToScrollTo && pageToScrollTo.ref.current) {
			pageToScrollTo.ref.current.scrollIntoView({ behavior: 'smooth' });
		} else {
			const firstPage = pageRef.current[0];
			if (firstPage && firstPage.ref.current) {
				firstPage.ref.current.scrollIntoView({ behavior: 'smooth' });
			}
		}

		prevLengthRef.current = currentPages.length;
	}, [selectedPageID, currentPages.length, scrollPageListToEndRequest]);

	if (visiblePages.length > 0) {
		return (
			<div
				className={`page-list-shell relative flex h-full min-h-0 flex-1 ${
					showLeftFade ? 'page-list-shell--scrolled' : ''
				}`}>
				<div
					ref={listRef}
					onScroll={updateLeftFade}
					className='page-list flex h-full min-h-0 w-full flex-1 items-start gap-0.75 overflow-x-auto overflow-y-hidden'>
					{visiblePages.map((page, index) => {
						const ref = createRef();
						pageRef.current[index] = { id: page.id, ref };
						const isSelectedPage = page.id === selectedPageID;
						const pageClassName = isSelectedPage ? 'selected-page' : '';

						return (
							<div
								key={page.id}
								style={{ scrollSnapAlign: 'center' }}
								className={`page-sheet-column shrink-0 ${pageClassName}`}
								ref={ref}>
								<SinglePage key={page.id} id={page.id} {...page} />
							</div>
						);
					})}
					<div
						className='page-list-end-spacer shrink-0'
						style={{ width: PAGE_LIST_END_SPACER_PX }}
						aria-hidden='true'
					/>
				</div>
				<div className='page-list-fade-left' aria-hidden='true' />
			</div>
		);
	}

	if (visiblePages.length === 0) {
		return (
			<div className='text-lg flex justify-center items-center w-full'>
				<h5>No pages are visible. Toggle visibility in Pages list.</h5>
			</div>
		);
	}
};

export default PageList;

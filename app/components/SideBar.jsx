'use client';

import { useContext, useMemo, useState } from 'react';
import { DragDropContext, Draggable } from '@hello-pangea/dnd';
import { DatabaseContext } from '../context/DatabaseContext';
import SideBarItem from './SideBarItem';
import { supabase } from '../api/supabase';
import { StrictModeDroppable } from './StrictModeDroppable';
import {
	normalizePageOrder,
	pageOrderChanged,
	reorderDraggablePages,
	splitPagesByJobDescription,
} from '../lib/pageOrder';

const SideBar = () => {
	const { currentPages, setCurrentPages } = useContext(DatabaseContext);
	const [isDragging, setIsDragging] = useState(false);

	const { jobDescriptionPage, draggablePages } = useMemo(
		() => splitPagesByJobDescription(currentPages),
		[currentPages],
	);

	const persistPageOrder = async (nextPages) => {
		setCurrentPages(nextPages);
		localStorage.setItem('currentPages', JSON.stringify(nextPages));

		await Promise.all(
			nextPages.map((page, index) =>
				supabase.from('pages').update({ position: index }).eq('id', page.id),
			),
		);
	};

	const updatePositionsOnDragEnd = async (result) => {
		if (!result.destination) {
			return;
		}

		const { source, destination } = result;
		if (source.index === destination.index) {
			return;
		}

		const nextPages = reorderDraggablePages(
			currentPages,
			source.index,
			destination.index,
		);

		if (!pageOrderChanged(currentPages, nextPages)) {
			return;
		}

		await persistPageOrder(nextPages);
	};

	return (
		<div className='scroll-container'>
			{jobDescriptionPage ? (
				<div className='mb-0'>
					<SideBarItem page={jobDescriptionPage} />
				</div>
			) : null}

			<DragDropContext
				onDragStart={() => setIsDragging(true)}
				onDragEnd={(result) => {
					setIsDragging(false);
					updatePositionsOnDragEnd(result);
				}}>
				<StrictModeDroppable droppableId='pages'>
					{(provided) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							className={`draggable-area flex flex-col gap-0 rounded-xl transition-colors duration-150${isDragging ? ' dragging' : ''}`}>
							{draggablePages.map((page, index) => (
								<Draggable
									key={page.id}
									draggableId={String(page.id)}
									index={index}>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											style={provided.draggableProps.style}
											className={`sidebar-draggable-item${
												snapshot.isDragging ? ' is-dragging' : ''
											}`}>
											<SideBarItem page={page} />
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</StrictModeDroppable>
			</DragDropContext>
		</div>
	);
};

export default SideBar;

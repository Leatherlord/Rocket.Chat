/* eslint-disable no-nested-ternary */
import type { MouseEventHandler, ReactNode } from 'react';
import React, { memo, useState } from 'react';

export type ChipProps = {
	content: ReactNode;
	onClick?: MouseEventHandler;
	color: string;
	hoverColor?: string;
	hoverEffect?: boolean;
};

// eslint-disable-next-line react/display-name
export const Chip = memo<ChipProps>(({ content, onClick, color, hoverColor, hoverEffect }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				backgroundColor: hoverEffect && isHovered ? hoverColor ?? color : color,
				filter: hoverEffect && isHovered ? (hoverColor ? 'brightness(100%)' : 'brightness(95%)') : 'none',
				display: 'flex',
				justifyContent: 'space-between',
				minHeight: 28,
				padding: '7px 10px',
				borderRadius: 3,
			}}
		>
			{typeof content === 'string' ? (
				<span
					style={{
						position: 'relative',
						display: 'inline-block',
						maxWidth: 200,
						overflow: 'hidden',
						color: 'white',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{content}
				</span>
			) : (
				content
			)}
		</div>
	);
});

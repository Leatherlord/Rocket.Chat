import React, { forwardRef, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useClickOutside } from '../hooks/useClickOutside';
import { useForwardRef } from '../hooks/useForwardRef';
import { Chip } from './Chip';

export type ValueType = {
	content?: ReactNode;
	value: string;
	key: number;
};

export type MultiSelectInputProps = {
	inputPlaceholder?: string;
	values?: ValueType[];
	options?: ValueType[];
	selected?: ValueType[];
	onSelect?: (value: ValueType) => void;
	onRemove?: (value: ValueType) => void;
	onInputChange?: (event: React.ChangeEvent<HTMLImageElement>) => void;
	onInputBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
	inputName?: string;
	onApprove?: () => void;
};

// eslint-disable-next-line react/display-name
export const MultiSelectInput = forwardRef<HTMLInputElement, MultiSelectInputProps>(
	(
		{
			options = [],
			values = [],
			onSelect,
			onRemove: onRemoveProp,
			onInputChange: onInputChangeProp,
			inputPlaceholder = '',
			onInputBlur,
			inputName,
			selected,
			onApprove,
		},
		ref,
	) => {
		const [isExpanded, setExpanded] = useState(false);
		const [inputValue, setInputValue] = useState<string>('');

		const onInputChange = useCallback(
			(event) => {
				setInputValue(event.target.value);
				onInputChangeProp?.(event);
			},
			[onInputChangeProp],
		);

		const insideRef = useRef<HTMLDivElement>(null);
		const expansionRef = useClickOutside<HTMLDivElement>(() => setExpanded(() => false), [insideRef], [values]);
		const inputRef = useForwardRef<HTMLInputElement>(ref);

		const handleExpansion = useCallback(
			(newExpanded) => {
				setExpanded(() => newExpanded);
			},
			[setExpanded],
		);

		const onRemove = useCallback(
			(e, value) => {
				e.stopPropagation();
				e.preventDefault();
				onRemoveProp?.(value);
			},
			[onRemoveProp],
		);

		return (
			<div
				style={{
					position: 'relative',
					width: '100%',
					minWidth: 330,
				}}
				ref={expansionRef}
				onClick={() => inputRef.current?.focus()}
			>
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: 8,
						alignItems: 'center',
						width: '100%',
						minHeight: 36,
						maxHeight: 100,
						padding: '6px 14px',
						overflowY: 'scroll',
						cursor: 'pointer',
						background: 'white',
						border: '1px solid gray',
						borderRadius: 3,
					}}
					ref={insideRef}
				>
					{values.map((value, idx) => (
						<Chip
							key={value.key ?? idx}
							onClick={(e) => onRemove(e, value)}
							content={value.content ?? value.value}
							color='#2f343d'
							hoverColor='#1f2329'
							hoverEffect={true}
						/>
					))}
					<div
						style={{
							display: 'flex',
							width: '100%',
						}}
					>
						<input
							style={{
								flexGrow: 1,
								height: 18,
								fontSize: 14,
								fontWeight: 600,
								lineHeight: 18,
								backgroundColor: 'white',
								border: 'none',
								outline: 'none',
							}}
							ref={inputRef}
							placeholder={inputPlaceholder}
							value={inputValue}
							onFocus={() => handleExpansion(true)}
							onClick={(e) => isExpanded && e.stopPropagation()}
							onChange={(event) => onInputChange(event)}
							onBlur={onInputBlur}
							name={inputName}
						/>
					</div>
				</div>
				{isExpanded && (
					<ul
						style={{
							position: 'absolute',
							zIndex: 2,
							width: '100%',
							maxHeight: 390,
							padding: '4px 6px',
							margin: '4px 0 0',
							overflow: 'auto',
							backgroundColor: 'white',
							borderRadius: 3,
						}}
					>
						{options.map((option, index) => (
							<li
								style={{
									display: 'flex',
									height: 36,
									padding: '10px 12px',
									cursor: 'pointer',
									borderRadius: 3,
								}}
								key={index}
								onClick={(e) => {
									e.stopPropagation();
									onSelect?.(option);
								}}
							>
								<input
									style={{
										marginRight: 8,
									}}
									type='checkbox'
									checked={selected?.includes(option)}
									onChange={() => onSelect?.(option)}
								/>
								<span>{option.value}</span>
							</li>
						))}
						<input
							type='button'
							onClick={(event) => {
								event.stopPropagation();
								onApprove?.();
								handleExpansion(false);
								const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
								nativeInputValueSetter?.call(inputRef.current, '');
								inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
								// setInputValue('');
							}}
							value='Approve'
						/>
					</ul>
				)}
			</div>
		);
	},
);

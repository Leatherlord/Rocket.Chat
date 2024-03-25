import type { IMessageSearchProvider } from '@rocket.chat/core-typings';
import { Box, Field, FieldLabel, FieldRow, FieldHint, ToggleSwitch } from '@rocket.chat/fuselage';
import { useDebouncedCallback, useMutableCallback, useUniqueId } from '@rocket.chat/fuselage-hooks';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useSynonymsQuery } from '../hooks/useSynonymsQuery';
import type { ValueType } from './MultiSelectInput';
import { MultiSelectInput } from './MultiSelectInput';

type MessageSearchFormProps = {
	provider: IMessageSearchProvider;
	onSynonym: (params: { searchText: string }) => void;
	setQuery: (query: { selected: string[]; rejected: string[] }[]) => void;
};

const MessageSearchForm = ({ provider, onSynonym, setQuery }: MessageSearchFormProps) => {
	const { handleSubmit, register, setFocus, control } = useForm({
		defaultValues: {
			searchText: '',
			globalSearch: false,
		},
	});

	useEffect(() => {
		setFocus('searchText');
	}, [setFocus]);

	const debouncedOnSynonym = useDebouncedCallback(useMutableCallback(onSynonym), 300);

	const submitHandler = handleSubmit(({ searchText }) => {
		debouncedOnSynonym.cancel();
		onSynonym({ searchText });
	});

	const searchText = useWatch({ control, name: 'searchText' });

	useEffect(() => {
		debouncedOnSynonym({ searchText });
	}, [debouncedOnSynonym, searchText]);

	const globalSearchEnabled = provider.settings.GlobalSearchEnabled;
	const globalSearchToggleId = useUniqueId();

	const t = useTranslation();

	const { onChange: onInputChange, onBlur: onInputBlur, name: inputName, ref: inputRef } = register('searchText');

	const synonyms = useSynonymsQuery({ searchText });
	const [values, setValues] = useState<
		(ValueType & {
			selected: ValueType[];
			rejected: ValueType[];
		})[]
	>([]);
	const [selected, setSelected] = useState<ValueType[]>([]);

	useEffect(() => console.log(values), [values]);

	const handleSearch = useCallback(
		(
			values: (ValueType & {
				selected: ValueType[];
				rejected: ValueType[];
			})[],
		) => {
			console.log('Handler!', values);
			setQuery(
				values.map((value) => ({
					selected: value.selected.map((item) => item.value),
					rejected: value.rejected.map((item) => item.value),
				})),
			);
		},
		[setQuery],
	);

	return (
		<Box
			display='flex'
			flexGrow={0}
			flexShrink={1}
			flexDirection='column'
			p={24}
			borderBlockEndWidth={2}
			borderBlockEndStyle='solid'
			borderBlockEndColor='extra-light'
		>
			<Box is='form' onSubmit={submitHandler}>
				<Field>
					<FieldRow>
						{/* <TextInput
							addon={<Icon name='magnifier' size='x20' />}
							placeholder={t('Search_Messages')}
							aria-label={t('Search_Messages')}
							autoComplete='off'
							// {...register('searchText')}
						/> */}
						<MultiSelectInput
							inputPlaceholder={t('Search_Messages')}
							values={values}
							options={synonyms.data}
							selected={selected}
							onSelect={(value) => {
								setSelected((prev) => {
									if (prev.includes(value)) {
										return prev.filter((item) => item !== value);
									}
									return [...prev, value];
								});
							}}
							onApprove={() => {
								const newR = [
									...values,
									{
										value: searchText,
										key: 228,
										selected: [
											{
												value: searchText,
												key: 228,
											},
											...selected,
										],
										rejected: synonyms.data?.filter((item) => !selected.includes(item)) ?? [],
									},
								];
								setValues(() => newR);
								handleSearch(newR);
								setSelected([]);
							}}
							onRemove={(value) => {
								const newR = values.filter((item) => item.value !== value.value);
								setValues(() => newR);
								handleSearch(newR);
							}}
							onInputChange={(event) => {
								setSelected([]);
								onInputChange(event);
							}}
							onInputBlur={onInputBlur}
							ref={inputRef}
							inputName={inputName}
						/>
					</FieldRow>
					{provider.description && <FieldHint dangerouslySetInnerHTML={{ __html: t(provider.description as TranslationKey) }} />}
				</Field>
				{globalSearchEnabled && (
					<Field>
						<FieldRow>
							<FieldLabel htmlFor={globalSearchToggleId}>{t('Global_Search')}</FieldLabel>
							<ToggleSwitch id={globalSearchToggleId} {...register('globalSearch')} />
						</FieldRow>
					</Field>
				)}
			</Box>
		</Box>
	);
};

export default MessageSearchForm;

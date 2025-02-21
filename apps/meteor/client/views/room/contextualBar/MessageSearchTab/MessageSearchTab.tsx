import { Callout } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState } from 'react';

import {
	ContextualbarClose,
	ContextualbarContent,
	ContextualbarHeader,
	ContextualbarTitle,
	ContextualbarIcon,
} from '../../../../components/Contextualbar';
import { useRoomToolbox } from '../../contexts/RoomToolboxContext';
import MessageSearch from './components/MessageSearch';
import MessageSearchForm from './components/MessageSearchForm';
import { useMessageSearchProviderQuery } from './hooks/useMessageSearchProviderQuery';

const MessageSearchTab = () => {
	const providerQuery = useMessageSearchProviderQuery();

	const { closeTab } = useRoomToolbox();

	const [{ searchText }, handleSynonym] = useState({ searchText: '' });
	const [query, setQuery] = useState<{ selected: string[]; rejected: string[] }[]>([]);

	const t = useTranslation();

	return (
		<>
			<ContextualbarHeader>
				<ContextualbarIcon name='magnifier' />
				<ContextualbarTitle>{t('Search_Messages')}</ContextualbarTitle>
				<ContextualbarClose onClick={closeTab} />
			</ContextualbarHeader>
			<ContextualbarContent flexShrink={1} flexGrow={1} paddingInline={0}>
				{providerQuery.isSuccess && (
					<>
						<MessageSearchForm provider={providerQuery.data} onSynonym={handleSynonym} setQuery={setQuery} />
						<MessageSearch searchText={searchText} query={query} />
					</>
				)}
				{providerQuery.isError && (
					<Callout m={24} type='danger'>
						{t('Search_current_provider_not_active')}
					</Callout>
				)}
			</ContextualbarContent>
		</>
	);
};

export default MessageSearchTab;

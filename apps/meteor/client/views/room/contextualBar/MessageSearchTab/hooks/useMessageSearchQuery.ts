import { useMethod, useToastMessageDispatch, useTranslation, useUserId } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';

import { useRoom } from '../../../contexts/RoomContext';

export const useMessageSearchQuery = ({
	query,
	limit,
	globalSearch,
}: {
	query: {
		selected: string[];
		rejected: string[];
	}[];
	limit: number;
	globalSearch: boolean;
}) => {
	const uid = useUserId() ?? undefined;
	const room = useRoom();

	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const searchMessages = useMethod('rocketchatSearch.search');
	return useQuery(
		['rooms', room._id, 'message-search', { uid, rid: room._id, query, limit, globalSearch }] as const,
		async () => {
			const result = await searchMessages(query, { uid, rid: room._id }, { limit, searchAll: globalSearch });
			return result.message?.docs ?? [];
		},
		{
			keepPreviousData: true,
			onError: () => {
				dispatchToastMessage({
					type: 'error',
					message: t('Search_message_search_failed'),
				});
			},
		},
	);
};

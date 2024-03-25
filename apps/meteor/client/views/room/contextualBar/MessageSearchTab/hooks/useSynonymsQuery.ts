import { useMethod, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';

export const useSynonymsQuery = ({ searchText }: { searchText: string }) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const getSynonyms = useMethod('rocketchatSearch.synonyms');

	return useQuery(
		['synonyms', searchText] as const,
		async () => {
			const result = await getSynonyms(searchText);
			return result.synonyms ?? [];
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

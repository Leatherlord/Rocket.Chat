import type { IMessageSearchProvider, IMessageSearchSuggestion, IRoom, IUser } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import type { ReactNode } from 'react';

import { SearchLogger } from './logger/logger';
import type { IRawSearchResult, ISearchResult } from './model/ISearchResult';
import { searchProviderService, validationService } from './service';

type ValueType = {
	content?: ReactNode;
	value: string;
	key: number;
};

export type ISynonymsResult = {
	synonyms: ValueType[];
};

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'rocketchatSearch.getProvider'(): IMessageSearchProvider | undefined;
		'rocketchatSearch.search'(
			query: {
				selected: string[];
				rejected: string[];
			}[],
			context: { uid?: IUser['_id']; rid: IRoom['_id'] },
			payload: unknown,
		): Promise<ISearchResult>;
		'rocketchatSearch.synonyms'(text: string): Promise<ISynonymsResult>;
		'rocketchatSearch.suggest'(
			text: string,
			context: { uid?: IUser['_id']; rid: IRoom['_id'] },
			payload: unknown,
		): Promise<IMessageSearchSuggestion[]>;
	}
}

Meteor.methods<ServerMethods>({
	/**
	 * Get the current provider with key, description, resultTemplate, suggestionItemTemplate and settings (as Map)
	 */
	'rocketchatSearch.getProvider'() {
		const provider = searchProviderService.activeProvider;
		if (!provider) {
			return undefined;
		}

		return {
			key: provider.key,
			description: provider.i18nDescription,
			icon: provider.iconName,
			resultTemplate: provider.resultTemplate,
			supportsSuggestions: provider.supportsSuggestions,
			suggestionItemTemplate: provider.suggestionItemTemplate,
			settings: Object.fromEntries(Object.values(provider.settingsAsMap).map((setting) => [setting.key, setting.value] as const)),
		};
	},
	/**
	 * Search using the current search provider and check if results are valid for the user. The search result has
	 * the format `{messages:{start:0,numFound:1,docs:[{...}]},users:{...},rooms:{...}}`
	 * @param text the search text
	 * @param context the context (uid, rid)
	 * @param payload custom payload (e.g. for paging)
	 */
	async 'rocketchatSearch.search'(query, context, payload) {
		payload = payload !== null ? payload : undefined; // TODO is this cleanup necessary?

		if (!searchProviderService.activeProvider) {
			throw new Error('Provider currently not active');
		}

		SearchLogger.debug({ msg: 'search', query, context, payload });

		let searchRegex = '';
		query.forEach((item) => {
			searchRegex = searchRegex ? `${searchRegex}|${item.selected[0]}` : `${item.selected[0]}`;
		});
		searchRegex = `/${searchRegex}/`;

		return new Promise<IRawSearchResult>((resolve, reject) => {
			searchProviderService.activeProvider?.search(searchRegex, context, payload, (error, data) => {
				if (error) {
					return reject(error);
				}

				return resolve(data);
			});
		}).then((result) => validationService.validateSearchResult(result));
	},

	async 'rocketchatSearch.synonyms'(text) {
		if (!searchProviderService.activeProvider) {
			throw new Error('Provider currently not active');
		}

		SearchLogger.debug({ msg: 'synonyms', text });

		return new Promise<ISynonymsResult>((resolve, _) => {
			const data = {
				synonyms:
					text === 'Hello'
						? [
								{
									value: 'Hello',
									key: 0,
								},
								{
									value: 'Hi',
									key: 1,
								},
								{
									value: 'Привет',
									key: 2,
								},
								{
									value: 'Salut',
									key: 3,
								},
						  ]
						: [
								{
									value: 'Not Hello',
									key: 0,
								},
						  ],
			};
			return resolve(data);
		});
	},

	async 'rocketchatSearch.suggest'(text, context, payload) {
		payload ??= undefined; // TODO is this cleanup necessary?

		if (!searchProviderService.activeProvider) {
			throw new Error('Provider currently not active');
		}

		SearchLogger.debug({ msg: 'suggest', text, context, payload });

		return new Promise((resolve, reject) => {
			searchProviderService.activeProvider?.suggest(text, context, payload, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data);
			});
		});
	},
});

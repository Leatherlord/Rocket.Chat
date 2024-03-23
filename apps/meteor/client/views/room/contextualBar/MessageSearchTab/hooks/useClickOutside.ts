import type { DependencyList, RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
	onClickOutside?: Function,
	insideRefs: RefObject<HTMLElement>[] = [],
	deps: DependencyList = [],
	enabled = true,
) => {
	const elementRef = useRef<T>(null);

	useEffect(() => {
		if (!enabled) return;
		const clickOutsideListener = (e) => {
			if (
				e.target.isConnected &&
				insideRefs.every((ref) => !ref.current?.contains(e.target)) &&
				!elementRef.current?.contains(e.target) &&
				e.target.isConnected
			) {
				onClickOutside?.();
			}
		};

		document.addEventListener('mousedown', clickOutsideListener);
		document.addEventListener('touchstart', clickOutsideListener);
		return () => {
			document.removeEventListener('mousedown', clickOutsideListener);
			document.removeEventListener('touchstart', clickOutsideListener);
		};
	}, [...deps, enabled]);

	return elementRef;
};

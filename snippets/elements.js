// @ts-check
const noop = () => {};

/**
 * requestAnimationFrame Closure
 *
 * ```js
 * const addClass = rAFC((el, i, arr) => el.classList.add('array-element', 'array-element--' + i, 'array-element--' + i + '-of-' + arr.length));
 *
 * document.querySelectorAll('.element').forEach(addClass);
 * ```
 * @param {(args: unknown[]) => void} fn
 * @returns {(args: unknown[]) => number}
 */
const rAFC =
	(fn) =>
	(...args) =>
		requestAnimationFrame(() => fn(...args));

/**
 * @param {HTMLElement} element
 * @param {string} [prefix]
 */
const getOptionsFromDataset = (element, prefix) => (
	(prefix = !!prefix ? prefix + '-' : ''),
	Object.assign(
		{},
		...Array.from(Object.values(element.attributes), (attr) =>
			attr.name.match('data-' + prefix)
				? {
						// key === attribute name after data-, and replace - & the following character with following character uppercase;
						[attr.name
							.split('data-' + prefix)[1]
							.replace(/-./g, (x) => x.toUpperCase()[1])]:
							attr.value,
				  }
				: false,
		).filter((v) => v),
	)
);

const fixRelOpener = () =>
	requestAnimationFrame(() =>
		document
			.querySelectorAll('a[target=_blank]:not([rel*=noopener])')
			.forEach((e) =>
				e.setAttribute('rel', e.getAttribute('rel') + ' noopener'),
			),
	);

const rIC =
	// @ts-expect-error
	self.requestIdleCallback ||
	((
		/** @type {(callbackArguments: { didTimeout: boolean; timeRemaining: (e: undefined) => number; }) => any} */ callback,
		start = +new Date(),
	) =>
		setTimeout(
			/** @param {undefined} l */ (l) =>
				callback({
					didTimeout: !1,
					timeRemaining: /** @param {undefined} e */ (e) =>
						Math.max(0, 50 - (+new Date() - start)),
				}),
			1,
		));

const cIC =
	//@ts-expect-error
	self.cancelIdleCallback || ((/** @type {number} */ e) => clearTimeout(e));

/**
 * Extend the base Event Object to make your own custom event
 * @param {string} type
 * @param {Event} originalEvent?
 * @param {object} detail?
 * @returns {CustomEvent}
 */
const extendEvent = (type, originalEvent = null, detail = {}) => {
	if (originalEvent !== null) Object.assign(detail, { originalEvent });
	const { bubbles, cancelable, composed } = originalEvent || {
		bubbles: true,
		cancelable: true,
		composed: true,
	};

	return new CustomEvent(type, {
		bubbles,
		cancelable,
		composed,
		detail,
	});
};

/**
 * importing the bottom three will allow you to do a requestAnimationTimeout, but
 * you can also add your own cancelAnimationFrameVariable or cancelAnimationTimeout if
 * you need something custom
 */
/**
 * cancelAnimationTimeout "rip cord"
 *
 * Allows you to cancel an animation from anywhere using this variable;
 */
let cancelAnimationFrameVariable = noop;
/**
 * @param {(raf: number) => void} requestAnimationTimeoutKey
 * @param {(raf: number) => void} cancelAnimationFrameVariable
 */
const cancelAnimationTimeout = (
	requestAnimationTimeoutKey,
	cancelAnimationFrameVariable,
) => (cancelAnimationFrameVariable = requestAnimationTimeoutKey);

/**
 * requestAnimationFrame with the benefits of setTimeout
 * @param {(args: unknown) => undefined} fn
 * @param {number} delay
 * @param {(arg: (raf:number) => void) => void} cancelAnimationTimeout
 */
const requestAnimationTimeout = (fn, delay, cancelAnimationTimeout) => {
	const start = performance.now();
	const loop = () => {
		const delta = performance.now() - start;

		if (delta >= delay) {
			fn();
			cancelAnimationTimeout(noop);
			return;
		}
		const raf = requestAnimationFrame(loop);
		cancelAnimationTimeout(() => cancelAnimationFrame(raf));
	};

	const raf = requestAnimationFrame(loop);
	cancelAnimationTimeout(() => cancelAnimationFrame(raf));
};

export {
	requestAnimationTimeout,
	cancelAnimationFrameVariable,
	cancelAnimationTimeout,
	fixRelOpener,
	rIC,
	cIC,
	rAFC,
	extendEvent,
	getOptionsFromDataset,
	noop,
};

// @ts-check
import { pipe } from './utils.js';

const handler = {
	/**
	 * @param {object} target
	 * @param {string} name
	 * @returns unknown
	 */
	get(target, name) {
		if (typeof target[name] != 'undefined') {
			if ('properties' in target === false)
				return Reflect.get(target, name);
			if (target.properties[target[name]])
				return Reflect.get(target, 'properties')[target[name]];
		}
		console.warn(`No such enumerator: ${name}`);
		return false;
	},
	/**
	 * Since our Enum is read only, this doesn't let us set any new values
	 * @param {object} x
	 * @param {string} key
	 * @param {unknown} name
	 */
	set(x, key, name) {
		console.warn(
			`Cannot add/update properties on an Enum instance after it is defined - ${key}: ${name}`,
		);
		return false;
	},
};

/**
 *
 * @param {object} enumObject
 * @returns {ProxyHandler<object, handler>}
 */
export const Enum = (enumObject) => new Proxy(enumObject, handler);

/**
 * a non CSPRNG random number generator
 * @param {number} a - the length of the returned id
 * @param {number} b? - the length of the Int8Array
 * @returns {string}
 */
export const randid = (a, b = 9) =>
	crypto
		.getRandomValues(new Int8Array(b))
		.map(Math.abs)
		.join('')
		.substr(0, a);

/**
 * Takes a string of invalid or non-compliant JSON and makes it spec-compliant
 *
 * ```json
 * {
 *   tokenName: 'something',
 * }
 * ```
 * Becomes:
 * ```json
 * {
 *   "tokenName": "something"
 * }
 * ```
 *
 * @param {string} text
 * @returns {string}
 */
export function JSONRelaxer(text) {
	/**
	 * @param {string} match
	 * @param {string} p1
	 * @returns {string}
	 */
	const quotes = (match, p1) => ': "' + p1.replace(/:/g, '@colon@') + '"';

	/**
	 * TODO: Swap this from two objects into something that isn't two objects -cw
	 */
	const regexs = {
		doubleQuotes: /:\s*"([^"]*)"/g,
		quotes: /:\s*'([^']*)'/g,
		wrapTokens: /(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g,
		replaceColonToken: /@colon@/g,
		removeTrailingCommas: /\,(?=\s*?[\}\]])/g,
	};

	const replacers = {
		doubleQuotes: quotes,
		quotes,
		wrapTokens: '"$2": ',
		replaceColonToken: ':',
		removeTrailingCommas: '',
	};

	/**
	 *
	 * @param {string} key
	 * @returns {(text: string) => string}
	 */
	const runReplace = (key) => (text) =>
		text.replace(regexs[key], replacers[key]);

	/** @type {string} */
	// @ts-ignore
	const relaxedJSON = pipe(
		runReplace('doubleQuotes'),
		runReplace('quotes'),
		runReplace('wrapTokens'),
		runReplace('replaceColonTokens'),
		runReplace('removeTrailingCommas'),
	)(text);

	return relaxedJSON;
}

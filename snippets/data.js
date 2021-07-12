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
 * #### A storage solution aimed at replacing jQuerys data function.
 * 
 * Implementation Note: Elements are stored in a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).
 * 
 * *This makes sure the data is garbage collected when the node is removed.*
 */
export const __Data = {
	_storage: new WeakMap(),
	/**
	 * @param {HTMLElement} element 
	 * @param {unknown} key 
	 * @param {object} obj 
	 */
	put: function (element, key, obj) {
		if (!this._storage.has(element)) {
			this._storage.set(element, new Map());
		}
		this._storage.get(element).set(key, obj);
	},
	/**
	 * @param {HTMLElement} element 
	 * @param {unknown} key 
	 */
	get: function (element, key) {
		return this._storage.get(element).get(key);
	},
	/**
	 * @param {HTMLElement} element 
	 * @param {unknown} key 
	 */
	has: function (element, key) {
		return this._storage.has(element) && this._storage.get(element).has(key);
	},
	/**
	 * @param {HTMLElement} element 
	 * @param {unknown} key 
	 */
	remove: function (element, key) {
		var ret = this._storage.get(element).delete(key);
		if (this._storage.get(element).size === 0) {
			this._storage.delete(element);
		}
		return ret;
	}
}


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
 * @param {string} text - Malformed or non-compliant JSON-like string
 * 
 * ```json
 * { tokenName: 'something', }
 * ```
 * 
 * *Becomes*
 * 
 * ```json
 * { "tokenName": "something" }
 * ```
 *
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

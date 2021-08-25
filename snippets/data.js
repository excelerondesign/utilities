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
	/**
	 * Since our Enum is read only, this prevents deletion of any values
	 * @param {object} x
	 * @param {string} key
	 */
	deleteProperty(x, key) {
		console.warn(
			`Cannot delete properties on an Enum instance after it is defined - ${key}`,
		);
		return false;
	},
};

/**
 *
 * @param {object} enumObject
 * @returns {ProxyHandler<object, handler>}
 */
const Enum = (enumObject) => new Proxy(enumObject, handler);

/**
 * #### A storage solution aimed at replacing jQuerys data function.
 *
 * Implementation Note: Elements are stored in a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).
 *
 * *This makes sure the data is garbage collected when the node is removed.*
 */
const __Data = {
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
		return (
			this._storage.has(element) && this._storage.get(element).has(key)
		);
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
	},
};

/**
 * a non CSPRNG random number generator
 * @param {number} a - the length of the returned id
 * @param {number} b? - the length of the Int8Array
 * @returns {string}
 */
const randid = (a, b = 9) =>
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
function JSONRelaxer(text) {
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

/**
 *
 * @param {object} obj
 * @param {string} keys - formatted like so `key?.keyA?.keyB?.keyC
 */
const qd = (obj, keys) =>
	toString.call(obj) === '[object Object]'
		? keys
				.split('?.')
				.reduce(
					(currentObject, nextKey) =>
						null === currentObject || undefined === currentObject
							? currentObject
							: nextKey in currentObject
							? currentObject[nextKey]
							: undefined,
					obj,
				)
		: obj;

/**
 *
 * @param {object} obj
 * @param {string} keys - formatted as `key?.keyA?.keyB?.keyC?.possibleFunction();
 */
function optChain(obj, keys) {
	const callsAFunction = keys.indexOf('(') - 1;

	const keysArr = keys.indexOf('?.') > -1 ? keys.split('?.') : [keys];

	/**
	 * @param {object} obj
	 * @param {string} key
	 */
	const reducer = (obj, key) =>
		/* prettier-ignore */
		(null === obj || undefined === obj)
			? obj
			: key in obj === false
			? undefined
			/* prettier-ignore */
			: (callsAFunction && key.indexOf('(') === 0)
			? obj()
			: obj[key];

	try {
		if (
			obj === true ||
			obj === false ||
			toString.call(obj) === '[object Boolean]'
		)
			throw false;
		Reflect.has(obj, Symbol());
		return keysArr.reduce(reducer, obj);
	} catch (err) {
		return undefined;
	}
}

/**
 * @typedef BytesObject
 * @property {string} string
 * @property {number} number
 * @property {string|("B"|"KB"|"MB"|"GB"|"TB")} unit
 */

/**
 *
 * @param {number} bytes - The starting number of bytes
 * @param {number} fixed - The fixed place to put the decimal to.
 *
 * @returns {BytesObject}
 */
function convertBytes(bytes = 0, fixed = 1) {
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0 || i === 0) {
		return {
			string: `${bytes}B`,
			number: bytes,
			unit: units[0],
		};
	}
	const num = (bytes / Math.pow(1024, i)).toFixed(fixed);
	return {
		string: `${num}${units[i]}`,
		number: parseFloat(num),
		unit: units[i],
	};
}
export { optChain, qd, Enum, JSONRelaxer, randid, __Data, convertBytes };

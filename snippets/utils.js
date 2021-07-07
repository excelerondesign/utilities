// @ts-check
// https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
export const pipe =
	(/** @type {((arg: any) => any)[]} */ ...fns) =>
	(/** @type {unknown} */ x) =>
		fns.reduce((v, f) => f(v), x);

export const noop = () => {};

/**
 * Returns the true type of a variable
 *
 * e.g. `{}` returns `Object`, `[]` returns `Array`, and `function(){}` returns `Function`
 * @param {any} obj
 * @returns {string}
 */
export const type = (obj) => Object.prototype.toString.call(obj).slice(8, -1);

/**
 * @param {()=>void} fn
 */
export const createWorker = (fn) =>
	new Worker(
		URL.createObjectURL(
			new Blob(['self.onmessage=' + fn.toString() + ';'], {
				type: 'text/javascript',
			}),
		),
	);

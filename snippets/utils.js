// @ts-check
// https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
const pipe =
	(/** @type {((arg: any) => any)[]} */ ...fns) =>
	(/** @type {unknown} */ x) =>
		fns.reduce((v, f) => f(v), x);

const noop = () => {};

/**
 * Returns the true type of a variable
 *
 * e.g. `{}` returns `object`, `[]` returns `array`, and `function(){}` returns `function`
 * @param {any} obj
 * @returns {string}
 */
const type = obj =>
	Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();

/**
 * @param {()=>void} fn
 */
const createWorker = fn =>
	new Worker(
		URL.createObjectURL(
			new Blob(['self.onmessage=' + fn.toString() + ';'], {
				type: 'text/javascript',
			}),
		),
	);

export { type, noop, pipe, createWorker };

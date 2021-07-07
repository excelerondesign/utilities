// @ts-check
// https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
export const pipe =
	(/** @type {((arg: any) => any)[]} */ ...fns) =>
	(/** @type {unknown} */ x) =>
		fns.reduce((v, f) => f(v), x);

export const noop = () => {};

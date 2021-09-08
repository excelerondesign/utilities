// @ts-check
/**
 * Very simple in-browser unit-test library, with zero deps.
 *
 * Background turns green if all tests pass, otherwise red.
 * View the JavaScript console to see failure reasons.
 *
 * Example:
 *
 *   adder.js (code under test)
 *
 *     function add(a, b) {
 *       return a + b;
 *     }
 *
 *   adder-test.html (tests - just open a browser to see results)
 *
 *     <script src="tinytest.js"></script>
 *     <script src="adder.js"></script>
 *     <script>
 *
 *     tests({
 *
 *       'adds numbers': function() {
 *         eq(6, add(2, 4));
 *         eq(6.6, add(2.6, 4));
 *       },
 *
 *       'subtracts numbers': function() {
 *         eq(-2, add(2, -4));
 *       },
 *
 *     });
 *     </script>
 *
 * That's it. Stop using over complicated frameworks that get in your way.
 *
 * -Joe Walnes
 * MIT License. See https://github.com/joewalnes/jstinytest/
 */

/**
 * @param {{ [key:string]: function }} tests
 */
export const run = tests => {
	let failures = 0;
	for (let testName in tests) {
		let testAction = tests[testName];

		try {
			testAction();
			console.log('Test:', testName, 'OK');
		} catch (e) {
			failures++;
			console.error('Test:', testName, 'FAILED', e);
			console.error(e.stack);
		}
	}
	requestAnimationFrame(
		() =>
			(document.body.style.backgroundColor =
				failures == 0 ? '#99ff99' : '#ff9999'),
	);
};

/**
 * @param {string} msg
 */
export const fail = msg => {
	throw new Error('fail(): ' + msg);
};

/**
 * @param {unknown} value
 * @param {string} msg
 */
export const assert = (value, msg) => {
	if (!value) throw new Error('assert(): ' + msg);
};

/**
 * @param {unknown} expected
 * @param {unknown} actual
 */
export const assertEquals = (expected, actual) => {
	if (expected != actual)
		throw new Error(
			'assertEquals(): "' + expected + '" != "' + actual + '"',
		);
};

/**
 * @param {unknown} expected
 * @param {unknown} actual
 */
export const assertStrictEquals = (expected, actual) => {
	if (expected !== actual) {
		throw new Error(
			'assertStrictEquals(): "' + expected + '" !== "' + actual + '"',
		);
	}
};

export const eq = assertEquals;

export const tests = run;

function isInert(node) {
	// See https://www.w3.org/TR/html5/editing.html#inert
	let sty = getComputedStyle(node);
	return (
		node.offsetHeight <= 0 ||
		/hidden/.test(sty.getPropertyValue('visibility'))
	);
}

function focusNext(e) {
	// Selector lifted from `jkup/focusable.git`
	let focusable = Array.from(
			document.querySelectorAll(
				'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], audio[controls], video[controls]',
			),
		),
		step = e && e.shiftKey ? -1 : 1,
		activeIndex = focusable.indexOf(document.activeElement),
		nextActiveIndex = activeIndex + step,
		nextActive = focusable[nextActiveIndex];

	// Skip inert elements.
	while (nextActive && isInert(nextActive)) {
		nextActive = focusable[(nextActiveIndex += step)];
	}

	if (nextActive) {
		nextActive.focus();
		e && e.preventDefault();
	} else {
		// Allow focus to leave the document when there is no nextActive
		document.activeElement.blur();
	}
}

/** based off of this codepen: https://codepen.io/lakshithav24/pen/xxxNPgN?editors=1010 */
class MultiDropdown extends HTMLElement {
	constructor() {
		super();

		this._options = this.querySelector('.select-options');
		this._title = this.querySelector('.select-title');
		this.isOpen = false;
	}

	handleEvent(event) {
		this['on' + event.type](event);
	}

	get _TOGGLE_KEYS() {
		return ['Space', 'Enter'];
	}

	get _VALID_KEYS() {
		return [
			'Space',
			'Enter',
			'Tab',
			'ArrowRight',
			'ArrowUp',
			'ArrowLeft',
			'ArrowDown',
			'Escape',
		];
	}

	open(originalEvent) {
		this.classList.add('open');
		this.isOpen = true;

		this.dispatch('toggle', originalEvent, {
			isOpen: this.isOpen,
			values: Array.from(
				this._options.querySelectorAll('[type="checkbox"]:checked'),
				(el) => el.value,
			),
		});
	}

	close(originalEvent) {
		this.classList.remove('open');
		this.isOpen = false;
		this.dispatch('toggle', originalEvent, {
			isOpen: this.isOpen,
			values: Array.from(
				this._options.querySelectorAll('[type="checkbox"]:checked'),
				(el) => el.value,
			),
		});
	}

	toggle(originalEvent = null) {
		this.classList.toggle('open');
		this.isOpen = !this.isOpen;

		this.dispatch('toggle', originalEvent, {
			isOpen: this.isOpen,
			values: Array.from(
				this._options.querySelectorAll('[type="checkbox"]:checked'),
				(el) => el.value,
			),
		});
	}

	dispatch(name, originalEvent, detail) {
		if (originalEvent !== null) Object.assign(detail, { originalEvent });
		const { bubbles, cancelable, composed } = originalEvent || {
			bubbles: true,
			cancelable: true,
			composed: true,
		};

		this.dispatchEvent(
			new CustomEvent('multi-dropdown:' + name, {
				detail,
				bubbles,
				cancelable,
				composed,
			}),
		);
	}
	/**
	 * `event.relatedTarget` is the element that focus was moved to
	 *
	 * Given the below HTML:
	 *
	 * ```html
	 * <input id="input1" type="text" />
	 * <input id="input2" type="text" onblur="getRelatedTarget" />
	 * <input id="input3" type="text" />
	 * <script>
	 *   const getRelatedTarget = ({
	 *      target,
	 *      relatedTarget
	 *   }) => console.log(target, relatedTarget);
	 * </script>
	 * ```
	 *
	 * Moving focus from #input2 to #input3 then:
	 *
	 * - target === #input2
	 * - relatedTarget === #input3
	 *
	 * Likewise, moving focus from #input2 to #input3:
	 *
	 * - target === #input2
	 * - relatedTarget === #input1
	 */
	onblur(event) {
		const { target, relatedTarget } = event;
		if (!this.contains(relatedTarget) && this.isOpen) {
			return this.close(event);
		}

		if (
			target.matches('.select-options [type="checkbox"]') &&
			!this.contains(relatedTarget) &&
			this.isOpen
		) {
			return this.close(event);
		}
	}

	onkeydown(event) {
		const { code, target } = event;
		if (!this._VALID_KEYS.includes(code)) return;

		event.preventDefault();

		if (code === 'Escape') {
			this.focus();
			this.close(event);
			return;
		}

		if (this._TOGGLE_KEYS.includes(code)) {
			if (this.isSameNode(target)) {
				return this.toggle(event);
			}

			if (target.matches('[type="checkbox"]')) {
				target.checked = !target.checked;
				return;
			}
		}

		if (code === 'Tab') {
			focusNext(event);
			return;
		}
	}

	onclick(event) {
		const { target } = event;
		if (target.matches('.select-title')) {
			return this.toggle(event);
		}

		if (this.isOpen && !this.contains(target)) {
			return this.close(event);
		}
	}

	onchange(event) {
		if (!event.target.matches('[type="checkbox"]')) return;

		this.dispatch('change', {
			element: event.target,
			values: Array.from(
				this._options.querySelectorAll('[type="checkbox"]:checked'),
				(el) => el.value,
			),
		});
	}

	connectedCallback() {
		if (!this.isConnected) return;
		document.addEventListener('click', this, false);
		this.addEventListener('change', this, false);
		this.addEventListener('keydown', this, false);
		this.addEventListener('blur', this, true);
		this.setAttribute('tabindex', '0');
	}

	disconnectedCallback() {
		document.removeEventListener('click', this, false);
		this.removeEventListener('change', this, false);
		this.removeEventListener('keydown', this, false);
		this.removeEventListener('blur', this, true);
		this.removeAttribute('tabindex');
	}
}

customElements.define('multi-dropdown', MultiDropdown);

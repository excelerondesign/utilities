<header>
 <h1>Multi-Dropdown Web Component</h1>
</header>
Used as a progressive enhancement.

Take a group of checkbox inputs and turn them into a dropdown.

## How to

Add the Javascript using a `<script>` tag with `[type="module"]`.

```html
<script type="module" src="./path/to/javascript/file.js"></script>
```

Add the custom element and necessary HTML elements:

```html
<multi-dropdown>
  <div class="select-title">Dropdown Title</div>
  <div class="select-options">
    <div class="option">
      <input type="checkbox" name="input" id="input1" value="value1" />
      <label for="input1">Value 1</label>
    </div>
    ...
  </div>
</multi-dropdown>
```

<details>
  <summary><i>Notes for setup</i></summary>
  When setting up your HTML, what is shown should be considered the default HTML. If you need more complex or are constrained by different style needs, you only need the classes `.select-options` and `.select-title`.
</details>

## Styling

Styles are provided by default that are _sensible_, and should make it easy to add your own.

You will need to be mindful of your `:focus`, `:focus-within`, `:hover`, and other state styles.

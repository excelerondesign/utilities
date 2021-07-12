# Useful Utitlity Functions and Snippets

Javascript frontend utilities and snippets to help speed up development time

## Shout Outs

-   [Joe Walnes](https://github.com/joewalnes/jstinytest/) for JS TinyTest which has been updated and made into a more ES6 module-like style

## How to use

Add however you want to, either by uploading the file or using a link to the JSDelivr CDN link, then import the desired function.

**Example of the JSDeliver CDN link**

```html
<!-- Import from index.js compressed version -->
<script type="module">
	import {
		data,
		elements,
		utils,
	} from 'https://cdn.jsdelivr.net/gh/excelerondesign/utilities@{version}/dist/utilities.js';
</script>

<!-- Import from specific uncompressed versions -->
<script type="module">
	import {
		pipe,
		type,
	} from 'https://cdn.jsdelivr.net/gh/excelerondesign/utilities@1.0.0/snippets/utils.js';
	import { getOptionsFromDataset } from 'https://cdn.jsdelivr.net/gh/excelerondesign/utilities@1.0.0/snippets/elements.js';
	import { randid } from 'https://cdn.jsdelivr.net/gh/excelerondesign/utilities@1.0.0/snippets/data.js';
</script>
```

```js
import { assert } from './tinytest/tinytest.js';

assert(true);
```

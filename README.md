## Jump to

* [Overview](#overview)
* [Usage](#usage)
* [Installation](#installation)
* [Links](#links)
* [License](#license)

## Overview 
[[jump to TOC](#jump-to)]

A webpack preloader which transpiles ES6 lodash imports into 
typescript imports to help with tree-shaking.

Basically transpiles from ES6 syntax:

```js
import { debounce } from 'lodash';
```

into typescript syntax:

```js
import debounce = require('lodash/debounce');
```

before the source code is being taken through the typescript compiler.

This way webpack 2 will be able to only include the code that's being actually used.

## Installation
[[jump to TOC](#jump-to)]

1. Install the package:  
```sh
$ npm install lodash-ts-imports-loader --save-dev
```

## Usage
[[jump to TOC](#jump-to)]

In your `webpack.config.js` add the `lodash-ts-imports-loader` preloader:

```js
// ...
module: {
    rules: [
        {
            test: /\.ts$/,
            loader: 'lodash-ts-imports-loader',
            exclude: /node_modules/,
            enforce: "pre"
        },
        // ...
    ],
    // ...
}
// ...
```

Now somewhere in your `main.ts` typescript file add an ES6 import for lodash:

```js
import { debounce } from 'lodash';
// make sure you have this line as well otherwise you're not using the import member
// and the lodash code will not be included in the bundle
console.log(debounce); 
```

run webpack bundling and check your bundle size.

Update the code to:

```js
import { debounce, zip } from 'lodash';
// make sure you have this lines as well otherwise you're not using the import members
// and the lodash code will not be included in the bundle
console.log(debounce); 
console.log(zip); 
```

run webpack bundling and check your bundle size.  
This time the bundle size should be larger.

## Links 
[[jump to TOC](#jump-to)]

NPM:  
[https://www.npmjs.com/package/lodash-ts-imports-loader](https://www.npmjs.com/package/lodash-ts-imports-loader)  
GITHUB:  
[https://github.com/efidiles/lodash-ts-imports-loader.git](https://github.com/efidiles/lodash-ts-imports-loader.git)  

## Author 
[[jump to TOC](#jump-to)]

**Eduard Fidiles**

* [github/efidiles](https://github.com/efidiles)  
* [twitter/efidiles](http://twitter.com/efidiles)  

## License 
[[jump to TOC](#jump-to)]  
Released under the [MIT license](https://github.com/lodash-ts-imports-loader/lodash-ts-imports-loader/blob/master/LICENSE).


Copyright © 2016, [Eduard Fidiles](https://github.com/efidiles)  
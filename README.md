# Libheif for Web

An emscripten build of [libheif](https://github.com/strukturag/libheif) distributed as an npm module for the browser.

## Installation

```shell
npm i libheif-web
```

### Set libheif url

Download [libheif.min.js](https://github.com/joutvhu/libheif-web/releases/download/v1.12.0_libheif/libheif.min.js) from the [libheif v1.12.0 release](https://github.com/joutvhu/libheif-web/releases/tag/v1.12.0_libheif) and put it in your project's `assets` folder.

Use following code to set url for libheif.

```js
import useUrl from 'libheif-web';

useUrl('assets/scripts/libheif.min.js');
```

If you skip this step the url will automatically point to [libheif.min.js](https://github.com/joutvhu/libheif-web/releases/download/v1.12.0_libheif/libheif.min.js)

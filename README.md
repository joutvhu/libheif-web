# Libheif for Web

An emscripten build of [libheif](https://github.com/strukturag/libheif) distributed as an npm module for the browser.

## Installation

```shell
npm i libheif-web
```

### Set libheif url

Download [libheif.min.js](https://github.com/joutvhu/libheif-web/releases/download/v1.14.0_libheif/libheif.min.js) from the [libheif v1.12.0 release](https://github.com/joutvhu/libheif-web/releases/tag/v1.12.0_libheif) and put it in your project's `assets` folder.

Use following code to set url for libheif.

```ts
import {useUrl} from 'libheif-web';

useUrl('assets/scripts/libheif.min.js');
```

If you skip this step the url will automatically point to [libheif.min.js](https://github.com/joutvhu/libheif-web/releases/download/v1.14.0_libheif/libheif.min.js)

## Using

```ts
import {convertHeif, convertAllOfHeif} from 'libheif-web';

const pngImage = await convertHeif(heicFile, 'filename.png', 'image/png');

const images = await convertAllOfHeif(heicFile);
const firstPng = await images[0].convert('filename.png', 'image/png');
const secondPng = await images[1].convert('filename.png', 'image/png');
```

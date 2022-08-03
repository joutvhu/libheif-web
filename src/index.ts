let loader: Promise<any> | null = null;
let libheif: any = null;

const loadLib = async () => {
  if (libheif == null) {
    if (loader != null)
      return await loader;
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'assets/scripts/libheif.min.js';
      script.onload = event => {
        libheif = (window as any).libheif;
        if (libheif == null)
          reject(event);
        resolve(libheif);
      };
      script.onerror = event => {
        loader = null;
        document.head.removeChild(script);
        reject(event);
      };
      document.head.appendChild(script);
    });
    return await loader;
  }
  return libheif;
};

const isHeic = (buffer: any) => {
  const brandMajor = new TextDecoder('utf-8')
    .decode(buffer.slice(8, 12))
    .replace('\0', ' ')
    .trim();

  switch (brandMajor) {
    case 'mif1':
      return true; // {ext: 'heic', mime: 'image/heif'};
    case 'msf1':
      return true; // {ext: 'heic', mime: 'image/heif-sequence'};
    case 'heic':
    case 'heix':
      return true; // {ext: 'heic', mime: 'image/heic'};
    case 'hevc':
    case 'hevx':
      return true; // {ext: 'heic', mime: 'image/heic-sequence'};
  }

  return false;
};

const decodeImage = async (image: any) => {
  const width = image.get_width();
  const height = image.get_height();

  const arrayBuffer = await new Promise((resolve, reject) => {
    image.display({data: new Uint8ClampedArray(width * height * 4), width, height}, (displayData: any) => {
      if (!displayData) {
        return reject(new Error('HEIF processing error'));
      }

      resolve(displayData.data.buffer);
    });
  });

  return {width, height, data: arrayBuffer};
};

const decodeBuffer = async (options: { buffer: any, all: boolean }) => {
  if (!isHeic(options.buffer)) {
    throw new TypeError('input buffer is not a HEIC image');
  }

  const decoder = new libheif.HeifDecoder();
  const data = decoder.decode(options.buffer);

  if (!data.length) {
    throw new Error('HEIF image not found');
  }

  if (!options.all) {
    return await decodeImage(data[0]);
  }

  return data.map((image: any) => {
    return {
      decode: async () => await decodeImage(image)
    };
  });
};

export const convert = async (buffer: any) => {
  await loadLib();
  return await decodeBuffer({buffer, all: false});
};

export const convertAll = async (buffer: any) => {
  await loadLib();
  return await decodeBuffer({buffer, all: true});
};

export const encodeByCanvas = async (image: any) => {
  const clamped = new Uint8ClampedArray(image.data);
  const iData = new ImageData(clamped, image.width, image.height);
  const img = await createImageBitmap(iData);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d')?.drawImage(img, 0, 0, image.width, image.height);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => {
    if (blob != null)
      resolve(blob)
    else
      reject(`Can't convert canvas to blob.`);
  }));
};

export const convertHeic = async (file: File) => {
  const inputBuffer = await file.arrayBuffer();
  const output = await convert(inputBuffer);
  const result = await encodeByCanvas(output);
  return new File([result], file.name + '.png', {
    lastModified: Date.now(),
    type: result.type
  });
};

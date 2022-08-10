let libheifUrl: string | null = null;
let loader: Promise<any> | null = null;
let libheif: any = null;

const defaultLibheifUrl = 'https://github.com/joutvhu/libheif-web/releases/download/v1.12.0_libheif/libheif.min.js';

export const loadLib = async () => {
  if (libheif == null) {
    if (loader == null) {
      loader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = libheifUrl ?? defaultLibheifUrl;
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
    }
    return await loader;
  }
  return libheif;
};

export const useUrl = (url: string): void => {
  if (typeof url === 'string')
    libheifUrl = url;
};

export const isHeic = (buffer: any): boolean => {
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

interface ImageData {
  width: any;
  height: any;
  data: any;
}

interface ImageDecoder {
  decode: () => Promise<ImageData>;
}

export const decodeImage = async (image: any): Promise<ImageData> => {
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

export const decodeBuffer = async (options: { buffer: any, all: boolean }): Promise<ImageData | ImageDecoder[]> => {
  const libheif = await loadLib();

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

export const convert = async (buffer: any): Promise<ImageData> => {
  return await decodeBuffer({buffer, all: false}) as ImageData;
};

export const convertAll = async (buffer: any): Promise<ImageDecoder[]> => {
  return await decodeBuffer({buffer, all: true}) as ImageDecoder[];
};

export const encodeByCanvas = async (image: ImageData): Promise<HTMLCanvasElement> => {
  const clamped = new Uint8ClampedArray(image.data);
  const iData = new ImageData(clamped, image.width, image.height);
  const img = await createImageBitmap(iData);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d')?.drawImage(img, 0, 0, image.width, image.height);
  return canvas;
};

export const toDataURL = async (image: ImageData, type?: string, quality?: any): Promise<string> => {
  const canvas = await encodeByCanvas(image);
  return canvas.toDataURL(type, quality);
};

export const toBlob = async (image: ImageData, type?: string, quality?: any): Promise<Blob> => {
  const canvas = await encodeByCanvas(image);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => {
    if (blob != null)
      resolve(blob);
    else
      reject(`Can't convert canvas to blob.`);
  }, type, quality));
};

const fileSuffix = (type = 'image/png'): string => {
  switch (type) {
    case 'image/bmp':
      return '.bmp';
    case 'image/gif':
      return '.bmp';
    case 'image/jpeg':
      return '.jpg';
    case 'image/tiff':
      return '.tif';
    case 'image/webp':
      return '.webp';
    case 'image-xbitmap':
    case 'image/xbm':
      return '.xbm';
    case 'image/vnd.microsoft.icon':
    case 'image/x-icon':
      return '.ico';
    case 'image/svg+xml':
      return '.svg';
    case 'image/avif':
      return '.avif';
    case 'image/apng':
      return '.apng';
    case 'image/png':
    default:
      return '.png';
  }
};

export const toFile = async (image: ImageData, filename: string, type?: string, quality?: any): Promise<File> => {
  const result = await toBlob(image, type, quality);
  return new File([result], filename, {
    lastModified: Date.now(),
    type: result.type
  });
};

export const convertBuffer = async (buffer: any, filename: string, type?: string, quality?: any): Promise<File> => {
  const image = await convert(buffer);
  return await toFile(image, filename, type, quality);
};

export const convertHeif = async (file: File, filename?: string, type?: string, quality?: any): Promise<File> => {
  const inputBuffer = await file.arrayBuffer();
  return await convertBuffer(inputBuffer, filename ?? file.name + fileSuffix(type), type, quality);
};

interface ImageConverter {
  convert: (filename?: string, type?: string, quality?: any) => Promise<File>;
}

export const convertAllOfHeif = async (file: File): Promise<ImageConverter[]> => {
  const inputBuffer = await file.arrayBuffer();
  const images = await convertAll(inputBuffer);
  return images.map(data => ({
    convert: async (filename?: string, type?: string, quality?: any) => {
      const image = await data.decode();
      return await toFile(image, filename ?? file.name + fileSuffix(type), type, quality);
    }
  }));
};

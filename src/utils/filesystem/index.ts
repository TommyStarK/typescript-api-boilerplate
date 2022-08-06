import fs from 'fs';
import { URL } from 'url';

export const readdirAsync = (filePath: fs.PathLike) => new Promise<string[]>((resolve, reject) => {
  fs.readdir(filePath, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

export const readFileAsync = (filePath: string | number | Buffer | URL) => new Promise<Buffer>((resolve, reject) => {
  fs.readFile(filePath, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

export const unlinkAsync = (filePath: fs.PathLike) => new Promise<void>((resolve, reject) => {
  fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

// eslint-disable-next-line max-len
export const writeFileAsync = (filePath: string | number | Buffer | URL, content: any) => new Promise<void>((resolve, reject) => {
  fs.writeFile(filePath, content, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

export const encodeBase64 = async (filePath: string): Promise<string> => {
  const data = await readFileAsync(filePath);
  return Buffer.from(data).toString('base64');
};

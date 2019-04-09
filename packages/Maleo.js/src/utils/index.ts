import fs from 'fs';

/** @private is the given object/value a promise? */
export const isPromise = (value: any): boolean => isObject(value) && isFunction(value.then);

/** @private is the given object a Function? */
export const isFunction = (obj: any) => 'function' === typeof obj;

/** @private is the given object an Object? */
export const isObject = (obj: any) => obj !== null && typeof obj === 'object';

/** @private does the file exist */
export const fileExist = (folderPath, fileName: string) =>
  !!fs.readdirSync(folderPath).filter((p) => !!~p.indexOf(fileName)).length;

/** @private error handling for async await */
export const to = <T, U = Error>(
  promise: Promise<T>,
  errorExt?: object,
): Promise<[U | null, T | undefined]> => {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }

      return [err, undefined];
    });
};

import { isPromise, isFunction, isObject } from '@airy/maleo/lib/utils/index';

describe('[Utilities] Index', () => {
  test('isPromise should return true', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(
      isPromise(
        new Promise((resolve) => {
          return resolve('');
        }),
      ),
    ).toBe(true);
    expect(isPromise(Promise.reject())).toBe(true);
  });

  test('isPromise should return false', () => {
    expect(isPromise(setTimeout(new Function(), 0))).toBe(false);
    expect(isPromise({})).toBe(false);
    expect(isPromise([])).toBe(false);
    expect(isPromise(1)).toBe(false);
    expect(isPromise(true)).toBe(false);
    expect(isPromise('')).toBe(false);
    expect(isPromise()).toBe(false);
  });

  test('isFunction should return true', () => {
    expect(isFunction(new Function())).toBe(true);
    expect(
      isFunction(() => {
        return void 0;
      }),
    ).toBe(true);
    expect(
      isFunction(function() {
        return void 0;
      }),
    ).toBe(true);
  });

  test('isFunction should return false', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction(1)).toBe(false);
    expect(isFunction(true)).toBe(false);
    expect(isFunction('')).toBe(false);
    expect(isFunction()).toBe(false);
  });

  test('isObject should return true', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(new Object())).toBe(true);
    expect(isObject(new Array())).toBe(true);
    expect(isObject(new String())).toBe(true);
  });

  test('isObject should return false', () => {
    expect(isObject(new Function())).toBe(false);
    expect(isObject('')).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject()).toBe(false);
  });
});

// tslint:disable:no-console

export const requireRuntime = (path: string, callback: (error?: Error) => void = console.error) => {
  // Has to use this kind of require because webpack tries to
  // bundle up normal require as webpack analyzes it as dynamic import
  // more: https://github.com/webpack/webpack/issues/4175
  // @ts-ignore
  const req = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require;
  try {
    const requiredModule = req(path);
    callback();
    return typeof requiredModule.default !== 'undefined' ? requiredModule.default : requiredModule;
  } catch (err) {
    callback(err);
    return null;
  }
};

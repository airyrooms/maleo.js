// tslint:disable:no-console

export const requireRuntime = (path: string) => {
  // Has to use this kind of require because webpack tries to
  // bundle up normal require as webpack analyzes it as dynamic import
  // more: https://github.com/webpack/webpack/issues/4175
  // @ts-ignore
  const req = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require;
  try {
    const requiredModule = req(path);
    return typeof requiredModule.default !== 'undefined' ? requiredModule.default : requiredModule;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const requireFile = (path: string) => {
  try {
    const file = requireRuntime(path);
    return file;
  } catch (error) {
    console.log(`[ERROR] Error occured when require file ${path}`);
    return null;
  }
};

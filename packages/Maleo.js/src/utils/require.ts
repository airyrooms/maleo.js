// tslint:disable:no-console

export const requireDynamic = async (path: string) => {
  // Has to use this kind of require because webpack tries to
  // bundle up normal require as webpack analyzes it as dynamic import
  // more: https://github.com/webpack/webpack/issues/4175
  // @ts-ignore
  const requiredModule = await __non_webpack_require__(path);

  return typeof requiredModule.default !== 'undefined' ? requiredModule.default : requiredModule;
};

export const requireRuntime = (path: string) => {
  const requiredModule =
    typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__(path) : require(path);

  return typeof requiredModule.default !== 'undefined' ? requiredModule.default : requiredModule;
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

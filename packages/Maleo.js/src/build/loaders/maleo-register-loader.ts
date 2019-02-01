import { loader } from 'webpack';
import loaderUtils from 'loader-utils';
import { REGISTERS } from '@constants/index';

const maleoRegisterLoader: loader.Loader = function() {
  const { absolutePagePath, page }: any = loaderUtils.getOptions(this);
  const stringifiedAbsolutePagePath = JSON.stringify(absolutePagePath);
  const stringifiedPage = JSON.stringify(page);

  return `
    (window.${REGISTERS.WINDOW_VAR_NAME}=window.${
    REGISTERS.WINDOW_VAR_NAME
  }||[]).push([${stringifiedPage}, function() {
      var page = require(${stringifiedAbsolutePagePath});
      if(module.hot) {
        module.hot.accept(${stringifiedAbsolutePagePath});
      }
      return page.default || page;
    }]);
  `;
};

export default maleoRegisterLoader;

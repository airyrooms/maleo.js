/**
 * Isomorphic CSS style loader for Webpack
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 *
 * https://github.com/kriasoft/isomorphic-style-loader/blob/master/src/StyleContext.js
 */

import React from 'react';

export default () => {
  let css = [];

  const StyleContext = React.createContext({
    css,
    insertCss: (() => {
      // Server side Insert CSS
      if (typeof window === 'undefined') {
        return (...styles) => {
          styles.forEach((style) => {
            const cssText = style._getCss();
            if (!~css.indexOf(cssText)) {
              css.push(cssText);
            }
          });
        };
      }

      return (...styles) => {
        const removeCss = styles.map((x) => x._insertCss());

        return () => {
          removeCss.forEach((f) => f());
        };
      };
    })(),
  });

  return StyleContext;
};

/*
  Fully inspired by Next.js' way of handling Header 
  The MIT License (MIT)
  Copyright (c) 2016-present ZEIT, Inc.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import React from 'react';

import Effect from './side-effect';

// Hacky way to acquire same context
let HeadManagerContext;
if (typeof window === 'undefined') {
  const path = require('path');
  const { requireRuntime } = require('@utils/require');
  HeadManagerContext = requireRuntime(path.resolve(__dirname, './manager-context'));
} else {
  HeadManagerContext = require('./manager-context').default;
}

export function defaultHead(className = 'maleo-head') {
  const head = [<meta key="charSet" charSet="utf-8" className={className} />];
  return head;
}

function onlyReactElement(
  list: Array<React.ReactElement<any>>,
  child: React.ReactChild,
): Array<React.ReactElement<any>> {
  // React children can be "string" or "number" in this case we ignore them for backwards compat
  if (typeof child === 'string' || typeof child === 'number') {
    return list;
  }
  // Adds support for React.Fragment
  if (child.type === React.Fragment) {
    return list.concat(
      React.Children.toArray(child.props.children).reduce(
        (
          fragmentList: Array<React.ReactElement<any>>,
          fragmentChild: React.ReactChild,
        ): Array<React.ReactElement<any>> => {
          if (typeof fragmentChild === 'string' || typeof fragmentChild === 'number') {
            return fragmentList;
          }
          return fragmentList.concat(fragmentChild);
        },
        [],
      ),
    );
  }
  return list.concat(child);
}

const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp'];

/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/
function unique() {
  const keys = new Set();
  const tags = new Set();
  const metaTypes = new Set();
  const metaCategories: { [metatype: string]: Set<string> } = {};

  return (h: React.ReactElement<any>) => {
    if (h.key && typeof h.key !== 'number' && h.key.indexOf('.$') === 0) {
      if (keys.has(h.key)) {
        return false;
      }
      keys.add(h.key);
      return true;
    }
    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) {
          return false;
        }
        tags.add(h.type);
        break;
      case 'meta':
        for (let i = 0, len = METATYPES.length; i < len; i++) {
          const metatype = METATYPES[i];
          if (!h.props.hasOwnProperty(metatype)) {
            continue;
          }

          if (metatype === 'charSet') {
            if (metaTypes.has(metatype)) {
              return false;
            }
            metaTypes.add(metatype);
          } else {
            const category = h.props[metatype];
            const categories = metaCategories[metatype] || new Set();
            if (categories.has(category)) {
              return false;
            }
            categories.add(category);
            metaCategories[metatype] = categories;
          }
        }
        break;
    }
    return true;
  };
}

/**
 *
 * @param headElement List of multiple <Head> instances
 */
function reduceComponents(headElements: Array<React.ReactElement<any>>) {
  return headElements
    .reduce((list: React.ReactChild[], headElement: React.ReactElement<any>) => {
      const headElementChildren = React.Children.toArray(headElement.props.children);
      return list.concat(headElementChildren);
    }, [])
    .reduce(onlyReactElement, [])
    .reverse()
    .concat(defaultHead())
    .filter(unique())
    .reverse()
    .map((c: React.ReactElement<any>, i: number) => {
      let className: string | undefined =
        (c.props && c.props.className ? c.props.className + ' ' : '') + 'maleo-head';

      if (c.type === 'title' && !c.props.className) {
        className = undefined;
      }
      const key = c.key || i;
      return React.cloneElement(c, { key, className });
    });
}

/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */
function Head({ children }: { children: React.ReactNode }) {
  return (
    <HeadManagerContext.Consumer>
      {({ updateHead, emitChange, addMountInstance, removeMountedInstance }) => (
        <Effect
          reduceComponentsToState={reduceComponents}
          handleStateChange={updateHead}
          emitChange={emitChange}
          addMountInstance={addMountInstance}
          removeMountedInstance={removeMountedInstance}>
          {children}
        </Effect>
      )}
    </HeadManagerContext.Consumer>
  );
}

export default Head;

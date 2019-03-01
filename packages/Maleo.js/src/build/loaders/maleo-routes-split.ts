import { getOptions } from 'loader-utils';
import { REGISTERS } from '@constants/index';

// Converts maleo-routes.json file into automatic dynamic import every page and transform it into react-router
export default function loader(source) {
  this.cacheable();
  const { server } = getOptions(this);

  const routes = replaceStringPage(source);

  if (!server) {
    // similar to maleo-register-loader for client
    return `
    const Dynamic = require('@airy/maleo/dynamic').default;
    (window.${REGISTERS.WINDOW_VAR_NAME} = window.${
      REGISTERS.WINDOW_VAR_NAME
    } || []).push(['routes', function() {
      return ${routes}
    }])
  `;
  }

  return `
    const Dynamic = require('@airy/maleo/dynamic').default;
    export default ${routes}
  `;
}

// Replaces routes string into Dynamic loading string
// using path and hashed path string as unique webpackChunkName identifier
function replaceStringPage(routes: string) {
  const pageRegex = /"page"(.*):(.*)"(.+)"/;
  const page = routes.match(pageRegex);

  if (page) {
    const [match, , , path] = page;
    let keyName = path.split('/').pop();
    keyName = 'dynamic.' + keyName + '-' + hashString(path);

    const newRoutes = routes.replace(
      match,
      `"component": Dynamic({ loader: () => import(/* webpackChunkName: "${keyName}" */ '${path}'), modules: ['${path}'] })`,
    );

    return replaceStringPage(newRoutes);
  }

  return routes;
}

// Produce a correct unique hash for each page path
function hashString(s) {
  const uniqueHash = s.split('').reduce(function(a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return uniqueHash.toString(36).substring(2, 15) + uniqueHash.toString(36).substring(2, 15);
}

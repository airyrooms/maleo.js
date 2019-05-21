import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AsyncRouteProps } from '@interfaces/render';
import { ExtraProps } from '../interfaces/routes';

/* TODO:
    - extend to recursive route rendering to support indented routes to
      also call getInitialProps and receive the data as props
*/
export const renderRoutes = (
  routes: AsyncRouteProps[],
  extraProps: ExtraProps,
  switchProps = {},
) => {
  if (extraProps === void 0) {
    extraProps = {};
  }

  if (switchProps === void 0) {
    switchProps = {};
  }

  const { location, initialData = {}, ...restProps } = extraProps;

  return routes ? (
    <Switch {...switchProps}>
      {routes.map((r, i) => {
        // If the route has no path we assume it is only a wrapper
        // therefore just render the component itself
        // if it has routes inside it we do render it recursively
        const routeInitialData = initialData[r.key as string] || {};

        if (!r.path) {
          return (
            // @ts-ignore
            <r.component
              {...{
                ...extraProps,
                ...routeInitialData,
                route: r,
                key: r.key || `wrapper-${r.component.displayName}-${i}`,
              }}>
              {!!r.routes && renderRoutes(r.routes, extraProps, switchProps)}
            </r.component>
          );
        }

        const render = (props) => {
          const childrenRoutes = !!r.routes && renderRoutes(r.routes, extraProps, switchProps);

          return r.render ? (
            // TODO: supports for custom renderer on each route
            // for the custom renderer we just pass all the data as is
            // so user will have more control
            r.render({
              ...props,
              ...extraProps,
              route: r,
              children: childrenRoutes,
            })
          ) : (
            <r.component
              {...{
                ...props,
                ...restProps,
                location,
                ...routeInitialData,
                route: r,
              }}>
              {childrenRoutes}
            </r.component>
          );
        };

        return (
          <Route
            key={r.key || `route-${r.path}-${i}`}
            path={r.path as string}
            exact={r.exact}
            location={extraProps.location}
            strict={r.strict}
            render={render}
          />
        );
      })}
    </Switch>
  ) : null;
};

// This will recursively map our format of routes to the format
// that react-router-config expects
export const convertRoutes = (customRouteConfig, parentRoute) => {
  return customRouteConfig.map((route) => {
    let pathResult = '';

    if (typeof route.path === 'function') {
      pathResult = route.path(parentRoute || '').replace('//', '/');
      return {
        path: pathResult,
        component: route.component,
        exact: route.exact,
        routes: route.routes ? convertRoutes(route.routes, pathResult) : [],
      };
    }

    pathResult = `${parentRoute}${route.path}`;
    return {
      path: pathResult,
      component: route.component,
      exact: route.exact,
      routes: route.routes ? convertRoutes(route.routes, pathResult) : [],
    };
  });
};

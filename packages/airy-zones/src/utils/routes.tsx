import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AsyncRouteProps, InitialProps } from '@interfaces/render/IRender';

interface ExtraProps {
  location?: Location<any> | null;
  initialData?: InitialProps['data'];
}

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
        if (!r.path) {
          return (
            <r.component
              {...{
                ...extraProps,
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
                ...(initialData[r.key as string] || {}),
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

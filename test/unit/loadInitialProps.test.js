const React = require('react');

const { matchingRoutes } = require('@airy/maleo/lib/server/routeHandler');
const { loadInitialProps } = require('@airy/maleo/lib/server/loadInitialProps');

describe('[Load Initial Props] Simple', () => {
  let routes = [];

  beforeEach(async () => {
    routes = [
      {
        path: '/not-matched',
        component: () => React.createElement('h1', null, 'Not Matched'),
        key: 'not-matched',
      },
      {
        path: '/match',
        component: () => React.createElement('h1', null, 'Hello World'),
        key: 'matched-routes',
        isExact: true,
      },
    ];
  });

  test('Should return matched route', async () => {
    const pathname = '/match';
    const mr = matchingRoutes(routes, pathname);
    const { branch, data } = await loadInitialProps(mr, {});

    expect(branch).toHaveProperty('route');
    expect(branch.route).toEqual(routes.find((r) => r.key === 'matched-routes'));
    expect(branch).toHaveProperty('match');
    expect(branch.match).toEqual({
      path: '/match',
      url: '/match',
      isExact: true,
      params: {},
    });
  });

  test('Should return no matched route', async () => {
    const pathname = '/404';
    const mr = matchingRoutes(routes, pathname);
    const { branch, data } = await loadInitialProps(mr, {});

    expect(branch).toBe(undefined);
    expect(data).toEqual({});
  });
});

describe('[Load Initial Props] Nested', () => {
  let routes = [];
  beforeEach(() => {
    routes = [
      {
        path: '/',
        component: (props) =>
          React.createElement(
            'div',
            null,
            React.createElement('h1', null, 'Wrapper'),
            props.children,
          ),
        key: 'root',
        routes: [
          {
            path: '/nested',
            component: () => React.createElement('h1', null, 'Nested'),
            key: 'nested',
          },
          {
            path: '/not-matched',
            component: () => React.createElement('h1', null, 'Not Matched'),
            key: 'not-matched',
          },
        ],
      },
    ];
  });

  test('Should render matched route(s)', async () => {
    const pathname = '/nested';
    const mr = matchingRoutes(routes, pathname);
    const { branch, data } = await loadInitialProps(mr, {});

    console.log(branch);
  });
});

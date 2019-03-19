import React from 'react';

import { matchingRoutes } from '@airy/maleo/lib/server/routeHandler';

describe('[Route Handler] Simple', () => {
  let routes = [];
  beforeEach(() => {
    routes = [
      {
        path: '/not-matched',
        component: () => <h1>Not Matched</h1>,
        key: 'not-matched',
      },
      {
        path: '/match',
        component: () => <h1>Match</h1>,
        key: 'match',
        isExact: true,
      },
    ];
  });

  test('Should return matched route', () => {
    const pathname = '/match';
    const mr = matchingRoutes(routes, pathname);

    const { route, match } = mr[0];

    expect(route).toEqual(routes[1]);
    expect(match).toEqual({
      path: routes[1].path,
      url: routes[1].path,
      isExact: routes[1].isExact,
      params: {},
    });
  });

  test('Should not return any matched route', () => {
    const pathname = '/';
    const mr = matchingRoutes(routes, pathname);

    expect(mr).toEqual([]);
    expect(mr.length).toBe(0);
  });
});

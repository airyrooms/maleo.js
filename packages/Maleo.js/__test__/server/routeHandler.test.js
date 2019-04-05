import React from 'react';

import { matchingRoutes } from '@airy/maleo/lib/routes/matching-routes';
import { MimickLoadable } from '../test-utils/mimick-loadable';

const NotMatchedComponent = MimickLoadable(() => <h1>Not Matched</h1>);
const MatchedComponent = MimickLoadable(() => <h1>Match</h1>);

describe('[Route Handler] Simple', () => {
  let routes = [];
  beforeEach(() => {
    routes = [
      {
        path: '/not-matched',
        component: NotMatchedComponent,
        key: 'not-matched',
      },
      {
        path: '/match',
        component: MatchedComponent,
        key: 'match',
        exact: true,
      },
    ];
  });

  test('Should return matched route', async () => {
    const pathname = '/match';
    const mr = await matchingRoutes(routes, pathname);

    const { route, match } = mr[0];

    const expectedMatchedRoutes = await (async function() {
      return { ...routes[1], component: (await routes[1].component.preload()).default };
    })();

    expect(route).toEqual(expectedMatchedRoutes);
    expect(match).toEqual({
      path: routes[1].path,
      url: routes[1].path,
      isExact: routes[1].exact,
      params: {},
    });
  });

  test('Should not return any matched route', async () => {
    const pathname = '/';
    const mr = await matchingRoutes(routes, pathname);

    expect(mr).toEqual([]);
    expect(mr.length).toBe(0);
  });
});

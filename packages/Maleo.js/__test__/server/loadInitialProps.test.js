import React from 'react';

import { matchingRoutes } from '@airy/maleo/lib/server/routeHandler';
import { loadInitialProps, loadComponentProps } from '@airy/maleo/lib/server/loadInitialProps';
import { MimickLoadable } from '../test-utils/mimick-loadable';

const initialProps = {
  root: {
    loadFromServer: [1, 2, 3, 4, 5],
  },
  match: {
    matchData: {
      a: 1,
      b: true,
      c: '3',
    },
  },
};

class RootComponent extends React.Component {
  static getInitialProps = (context) => {
    return initialProps.root;
  };

  render() {
    return (
      <div>
        <h1>Wrapper</h1>
        {this.props.children}
      </div>
    );
  }
}

class MatchComponent extends React.Component {
  static getInitialProps = (context) => {
    return initialProps.match;
  };

  render() {
    return <h1>Match Component</h1>;
  }
}

class NotMatchComponent extends React.Component {
  render() {
    return <h1>Not Match Component</h1>;
  }
}

class ComponentNoInitialProps extends React.Component {
  render() {
    return <h1>No initial props</h1>;
  }
}

describe('[Load Initial Props] Simple', () => {
  let routes = [];

  beforeEach(async () => {
    routes = [
      {
        path: '/not-matched',
        component: MimickLoadable(NotMatchComponent),
        key: 'not-matched',
      },
      {
        path: '/match',
        component: MimickLoadable(MatchComponent),
        key: 'match',
        exact: true,
      },
    ];
  });

  test('Should return matched route', async () => {
    const pathname = '/match';
    const mr = await matchingRoutes(routes, pathname);
    const { branch } = await loadInitialProps(mr, {});

    let matchedEqual = routes.find((r) => r.key === 'match');
    matchedEqual = {
      ...matchedEqual,
      component: (await matchedEqual.component.preload()).default,
    };

    expect(branch).toHaveProperty('route');
    expect(branch.route).toEqual(matchedEqual);
    expect(branch).toHaveProperty('match');
    expect(branch.match).toEqual({
      path: '/match',
      url: '/match',
      isExact: true,
      params: {},
    });
  });

  test('Should return inital props', async () => {
    const pathname = '/match';
    const mr = await matchingRoutes(routes, pathname);
    const { data } = await loadInitialProps(mr, {});

    expect(data).toEqual({ match: initialProps.match });
  });

  test('Should return no matched route', async () => {
    const pathname = '/404';
    const mr = await matchingRoutes(routes, pathname);
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
        component: MimickLoadable(RootComponent),
        key: 'root',
        routes: [
          {
            path: '/match',
            component: MimickLoadable(MatchComponent),
            key: 'match',
          },
          {
            path: '/not-matched',
            component: MimickLoadable(NotMatchComponent),
            key: 'not-matched',
          },
        ],
      },
    ];
  });

  test('Should render matched route(s)', async () => {
    const pathname = '/match';
    const mr = await matchingRoutes(routes, pathname);
    const { branch } = await loadInitialProps(mr, {});

    expect(branch.route.routes.length).toBe(2);
  });

  test('Should return inital props', async () => {
    const pathname = '/match';
    const mr = await matchingRoutes(routes, pathname);
    const { data } = await loadInitialProps(mr, {});

    expect(data).toEqual(initialProps);
  });
});

describe('[Load Component Props] Check component has getInitialProps properties', () => {
  test('Should return null', async () => {
    const result = await loadComponentProps(ComponentNoInitialProps, {});

    expect(result).toBe(null);
  });

  test('Should return result', async () => {
    const result = await loadComponentProps(MatchComponent, {});

    expect(result).toEqual(initialProps.match);
  });
});

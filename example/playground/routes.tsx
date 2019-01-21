import React from 'react';
import Dynamic from '@airy/maleo/lib/utils/dynamicImport';

import { RoomsMainApp } from './src/MainApp';

const Loading = () => <div>Loading ...</div>;

// console.log('Loading', Loading, Loading.prototype, typeof Loading);
// console.log('RoomsMainApp', RoomsMainApp, RoomsMainApp.prototype, typeof RoomsMainApp);
// console.log('Dynamic Component', (() => import('./src/Detail')).prototype);

const RoomsSearch = Dynamic({
  loader: () => import('./src/Search' /* webpackChunkName:"Search" */),
  loading: Loading,
  modules: ['./src/Search'],
});

const RoomsDetail = Dynamic({
  loader: () => import('./src/Detail' /* webpackChunkName:"Detail" */),
  loading: Loading,
  modules: ['./src/Detail'],
});

// import { RoomsDetail } from 'src/Detail';
// import { RoomsSearch } from 'src/Search';

export const routes = [
  {
    path: '/',
    component: RoomsMainApp,
    key: 'rootWrapper',
    routes: [
      {
        path: '/',
        key: 'rootPage',
        component: () => <h1>This is root path</h1>,
        exact: true,
      },
      {
        path: '/search',
        key: 'root-search',
        component: RoomsSearch,
        routes: [
          {
            path: '/search/hello',
            key: 'search-hello',
            component: RoomsDetail,
            exact: true,
          },
        ],
        // exact: true,
      },
      {
        path: '/detail',
        key: 'rootDetail',
        component: RoomsDetail,
        exact: true,
      },
      {
        path: '*',
        key: '404',
        component: () => <div>not found</div>,
      },
    ],
  },
];

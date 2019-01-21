import { matchRoutes as reactRouterMatchRoutes } from 'react-router-config';
import { AsyncRouteProps, Branch } from '@interfaces/render/IRender';

export const matchingRoutes = (routes: AsyncRouteProps[], pathname: string): Branch[] => {
  return reactRouterMatchRoutes(routes, pathname);
};

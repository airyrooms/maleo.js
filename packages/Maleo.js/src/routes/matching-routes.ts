import { matchRoutes as reactRouterMatchRoutes } from 'react-router-config';
import { AsyncRouteProps, Branch, PreBranch } from '@interfaces/render';

export const matchingRoutes = async (
  routes: AsyncRouteProps[],
  pathname: string,
): Promise<Branch[]> => {
  const matchedRoutes: PreBranch[] = reactRouterMatchRoutes(routes, pathname);

  const preloadedMatchedRoutes: Branch[] = [];

  await Promise.all(
    matchedRoutes.map(async (branch) => {
      const { component } = branch.route;

      // Preload Component route
      const { default: preloadComponent } = await component.preload();

      preloadedMatchedRoutes.push({
        ...branch,
        route: {
          ...branch.route,
          component: preloadComponent,
        },
      } as Branch);
    }),
  );

  return preloadedMatchedRoutes;
};

export default matchingRoutes;

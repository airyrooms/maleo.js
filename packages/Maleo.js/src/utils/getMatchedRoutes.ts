import { matchingRoutes } from '@routes/matching-routes';

export const getMatchedRoutes = async (routes, path, matchedRoutes?) => {
  const _matchedRoutes = matchedRoutes ? matchedRoutes : await matchingRoutes(routes, path);
  return _matchedRoutes.map((r) => ({ match: r.match, route: r.route }));
};

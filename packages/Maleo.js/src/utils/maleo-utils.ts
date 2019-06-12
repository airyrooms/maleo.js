import { Branch, AsyncRouteProps } from '@interfaces/render';
import matchingRoutes from '@routes/matching-routes';

export async function getMatchedRoutes(url: string, routes: AsyncRouteProps[]): Promise<Branch[]> {
  const matchedRoutes = await matchingRoutes(routes, url);

  return matchedRoutes;
}

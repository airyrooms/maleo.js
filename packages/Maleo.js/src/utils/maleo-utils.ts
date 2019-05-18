import { defaultGetServerAssets } from '@server/render';
import { Branch } from '@interfaces/render';
import matchingRoutes from '@routes/matching-routes';

export async function getMatchedRoutes(url: string): Promise<Branch[]> {
  const { routes } = await defaultGetServerAssets();

  const matchedRoutes = await matchingRoutes(routes, url);

  return matchedRoutes;
}

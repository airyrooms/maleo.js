import { REGISTERS } from '@constants/index';

export const registerRoutes = (routes) => {
  if (!__IS_SERVER__) {
    window[REGISTERS.ROUTES] = routes;
  }

  return routes;
};

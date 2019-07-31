import { InitialProps, Branch } from '@interfaces/render';
import { to, isPromise } from '@utils/index';

/**
 * loadInitialProps calls every getInitialProps functions on matched components
 * and map it to an object with keys as the identifier and the corresponding data
 * that's why key must be unique for every routes OR maybe we can find other way to automate this matter
 */
export const loadInitialProps = async (matchedRoutes: Branch[], ctx): Promise<InitialProps> => {
  let data: InitialProps['data'] = {};

  if (!matchedRoutes.length) {
    return { data };
  }

  for (const { route, match } of matchedRoutes) {
    const { component, key } = route;

    if (checkHasGetInitialProps(component)) {
      const keyData = await loadComponentProps(component, { match, ...ctx, route });

      data = {
        ...data,
        [key as string]: keyData,
      };
    }
  }

  return {
    // Only first match has the ability to redirect
    // TODO: don't hardcode index?
    branch: matchedRoutes[0],
    data,
  };
};

export const loadComponentProps = async (component: any, ctx: any = {}) => {
  if (checkHasGetInitialProps(component)) {
    const result = component.getInitialProps(ctx);

    const [error, res] = isPromise(result) ? await to(result) : [null, result];
    if (error) {
      // tslint:disable-next-line:no-console
      console.error(
        `[Maleo] Error while loading ${component.displayName || component.name} initial props`,
      );
      return null;
    }

    return res;
  }
  return null;
};

export const checkHasGetInitialProps = (object: any): boolean => {
  return 'getInitialProps' in object && typeof object.getInitialProps === 'function';
};

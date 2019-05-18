import { InitialProps, Branch } from '@interfaces/render';
// import { isPromise } from '@utils/';

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

  for (const route of matchedRoutes) {
    const {
      route: { component, key },
      match,
    } = route;

    if (checkHasGetInitialProps(component)) {
      const keyData = await loadComponentProps(component, { match, ...ctx });

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

const checkHasGetInitialProps = (object: any): boolean => {
  return 'getInitialProps' in object && typeof object.getInitialProps === 'function';
};

export const loadComponentProps = async (component: any, ctx: any = {}) => {
  if (checkHasGetInitialProps(component)) {
    const res = await component.getInitialProps(ctx);
    return res;
  }
  return null;
};

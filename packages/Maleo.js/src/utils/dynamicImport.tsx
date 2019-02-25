import { default as RL } from 'react-loadable';

export default (options) => {
  const defaultLoading = () => null;
  const { loading = defaultLoading, ...opts } = options;

  return RL({
    ...opts,
    loading,
  });
};

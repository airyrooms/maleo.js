// Mimicking react loadable preload function
// We need to do this kind of mimicking due to
// how we treat our routes.json
// We automatically register "page" key wrapped to react-loadable
// to satisfy our requirement to be able to do page-based code splitting automatically
export const MimickLoadable = (Component) => {
  return {
    preload: async () => ({
      default: Component,
    }),
  };
};

export default MimickLoadable;

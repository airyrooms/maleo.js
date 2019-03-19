import { createStore } from 'redux';

export const makeStore = (reducer, anyComposer) => {
  return (isServer, preloadedState) => {
    if (isServer) {
      return createStore(reducer, anyComposer);
    }

    return createStore(reducer, preloadedState, anyComposer);
  };
};

import { Action, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { makeStore } from '@airy/with-redux-plugin';

interface State {
  initVal: string;
}

interface ActionType extends Action {
  data: any;
}

const initialState: State = {
  initVal: 'hello world',
};

const initReducer = (state: State = initialState, action: ActionType): State => {
  const newState = { ...state };
  switch (action.type) {
    case 'TEST':
      newState.initVal = action.data;
      return newState;
    default:
      return state;
  }
};

export const reducer = combineReducers({
  init: initReducer,
});

export const makeStoreClient = makeStore(reducer, composeWithDevTools());

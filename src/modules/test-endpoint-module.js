import { createAction, createReducer } from 'redux-action';

export const ADD_RESULT = 'RA/TestEndpoint/ADD_RESULT';

export const cityChanged = createAction(ADD_RESULT, newValue => newValue);

const initialState = {
  results: [],
};

export default createReducer(initialState, {
  [ADD_RESULT]: state => state,
});

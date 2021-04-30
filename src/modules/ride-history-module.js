import { createAction, createReducer } from 'redux-action';
import { ridesAPI } from '../services/rest';
import { handleError } from './handle-error-module';

export const LOADING_ACTION = 'RA/User/LOADING_ACTION';
export const GET_RIDES_ACTION = 'RA/RideHistory/GET_RIDES_ACTION';
export const GET_MAP_ACTION = 'RA/RideHistory/GET_MAP_ACTION';

const loadingAction = createAction(LOADING_ACTION, data => data);

const getRideHistoryAction = createAction(GET_RIDES_ACTION, (dispatch, params) => {
  dispatch(loadingAction({loading: true}));
  return ridesAPI.getRides(params)
    .then(({data: serverResponse}) =>
      ({
        serverResponse,
        loading: false,
        error: false,
      })
    )
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    });
});

const getRideMapAction = createAction(GET_MAP_ACTION, (dispatch, rideId) =>
  ridesAPI.getRideMap(rideId)
    .then(({data}) => ({
      maps: {[rideId]: data.url || 'no map'},
      error: false,
    }))
    .catch(() =>
      ({
        maps: {[rideId]: 'no map'},
      })
    )
  );


export const actions = {
  loading: loadingAction,
};

export const complexActions = {
  getRideHistory: getRideHistoryAction,
  getRideMap: getRideMapAction,
};

const initialState = {
  loading: true,
  maps: {},
  serverResponse: {},
};

export default createReducer(initialState, {
  [LOADING_ACTION]: state => state,
  [GET_RIDES_ACTION]: state => state,
  [GET_MAP_ACTION]: (payload, {maps}) => ({ maps: Object.assign({}, maps, payload.maps) }),
});

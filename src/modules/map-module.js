import { createAction, createReducer } from 'redux-action';
import { handleError } from './handle-error-module';
import { setDriverOfflinePromise } from '../services/api';
import { ridesAPI } from '../services/rest';
import reverseGeoCoding from '../services/geoloc';

export const START_USERS_POLLING_ACTION = 'RA/Map/START_USERS_POLLING_ACTION';
export const STOP_USERS_POLLING_ACTION = 'RA/Map/STOP_USERS_POLLING_ACTION';
export const GET_USERS_MAP_ACTION = 'RA/Map/GET_USERS_MAP_ACTION';
export const SET_DRIVER_OFFLINE_ACTION = 'RA/Map/SET_DRIVER_OFFLINE_ACTION';
export const UPDATE_ONLINE_RIDES_ACTION = 'RA/Map/UPDATE_ONLINE_RIDES_ACTION';
export const FILTER_MAP_MARKERS_ACTION = 'RA/Map/FILTER_MAP_MARKERS_ACTION';
export const TOGGLE_FILTER_ACTION = 'RA/Map/TOGGLE_FILTER_ACTION';
export const GET_ADDRESS = 'RA/Map/GET_ADDRESS';

const getUsersMapAction = force => (dispatch, getState) => {
  if (getState().map.autoFetch || force) {
    return ridesAPI.getMap()
      .then(({data}) => {
        dispatch(getUsersMapAction());
        const users = _.map(data, (u) => {
          const user = Object.assign({}, u);
          user.status = user.status ? user.status : _.get(user, 'activeDriver.status');

          if (user.status === 'REQUESTED' && user.rider) {
            user.status = 'REQUESTED_RIDER';
          } else if (user.status === 'REQUESTED') {
            user.status = 'REQUESTED_DRIVER';
          }

          return user;
        });

        const availableDrivers = _.filter(users, user => user.status === 'AVAILABLE').length;
        const totalDrivers = users.length - _.filter(users, user => user.status === 'REQUESTED_RIDER').length;

        const count = _.countBy(users, ({status}) => status);

        return dispatch({
          type: GET_USERS_MAP_ACTION,
          payload: { users, count, availableDrivers, totalDrivers, loading: false },
        });
      })
      .catch(err => dispatch(handleError(err)));
  }
  return new Promise(resolve =>
    resolve(dispatch({
      type: GET_USERS_MAP_ACTION,
      payload: { users: [], count: {} },
    }))
  );
};

const getAddressAction = (latLng, driverId) => (dispatch, getState) => {
  reverseGeoCoding(latLng)
    .then(({data}) => {
      const addresses = Object.assign({}, getState().map.addresses, {
        [driverId]: {
          currentAddress: _.first(data.results) ?
            _.first(data.results).formatted_address :
            `Address: N/A (${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)})`,
        },
      });
      return dispatch({
        type: GET_ADDRESS,
        payload: { addresses },
      });
    });
};

const startUsersPollingAction =
  createAction(START_USERS_POLLING_ACTION, (dispatch) => {
    dispatch(getUsersMapAction(true));
    return {autoFetch: true};
  });

const stopUsersPollingAction =
  createAction(STOP_USERS_POLLING_ACTION, () => ({ autoFetch: false }));

const setDriverOfflineAction = createAction(SET_DRIVER_OFFLINE_ACTION, (dispatch, data) =>
  setDriverOfflinePromise({ id: data.driverId })
    .then(() => ({ payload: { id: data.id } }))
    .catch(err => dispatch(handleError(err)))
);

const updateOnlineRidesAction = createAction(UPDATE_ONLINE_RIDES_ACTION, data => data);

const filterMapMarkersAction = createAction(FILTER_MAP_MARKERS_ACTION, data => data);

const toggleFilterAction = filter => (dispatch, getState) =>
  dispatch({
    type: TOGGLE_FILTER_ACTION,
    payload: {filters: _.xor(getState().map.filters, [filter])},
  });

export const actions = {
  stopUsersPolling: stopUsersPollingAction,
  updateOnlineRides: updateOnlineRidesAction,
  filterMapMarkers: filterMapMarkersAction,
  toggleFilter: toggleFilterAction,
  getAddress: getAddressAction,
};

// Actions that need dispatch reference
export const complexActions = {
  setDriverOffline: setDriverOfflineAction,
  startUsersPolling: startUsersPollingAction,
  getUsersMap: getUsersMapAction,
};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};

const initialState = {
  loading: true,
  autoFetch: true,
  users: [],
  addresses: {},
  filters: [
    'ACTIVE',
    'AVAILABLE',
    'AWAY',
    'DRIVER_ASSIGNED',
    'DRIVER_REACHED',
    'REQUESTED_DRIVER',
    'REQUESTED_RIDER',
  ],
  count: {
    ACTIVE: 0,
    AVAILABLE: 0,
    AWAY: 0,
    DRIVER_ASSIGNED: 0,
    DRIVER_REACHED: 0,
    REQUESTED_DRIVER: 0,
    REQUESTED_RIDER: 0,
  },
};

const mapReducer = createReducer(initialState, {
  [GET_USERS_MAP_ACTION]: state => state,
  [START_USERS_POLLING_ACTION]: state => state,
  [STOP_USERS_POLLING_ACTION]: state => state,
  [SET_DRIVER_OFFLINE_ACTION]: state => state,
  [UPDATE_ONLINE_RIDES_ACTION]: state => state,
  [FILTER_MAP_MARKERS_ACTION]: state => state,
  [TOGGLE_FILTER_ACTION]: state => state,
  [GET_ADDRESS]: state => state,
});

export default mapReducer;

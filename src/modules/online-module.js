import { createAction, createReducer } from 'redux-action';
import { activeDriversAPI, ridesAPI } from '../services/rest';
import { handleError } from './handle-error-module';
import { actions as commonActions } from './common-module';
import { complexActions as rideActions } from './ride-module';

export const GET_ONLINE_DRIVERS = 'RA/Online/GET_ONLINE_DRIVERS';
export const GET_AAA_DRIVERS = 'RA/Online/GET_AAA_DRIVERS';
export const GET_REQUESTED_DRIVERS = 'RA/Online/GET_REQUESTED_DRIVERS';
export const CHANGE_PAGE = 'RA/Online/CHANGE_PAGE';
export const CLEAR_ACTION = 'RA/Online/CLEAR_ACTION';
export const LOADING = 'RA/Online/LOADING';
export const GET_DRIVER_LOCATION = 'RA/Online/GET_DRIVER_LOCATION';
export const CANCEL_RIDE = 'RA/Online/CANCEL_RIDE';

const loading = createAction(LOADING, state => state);

const getOnlineDrivers = createAction(GET_ONLINE_DRIVERS, (dispatch, params) => {
  dispatch(loading({onlineDriversLoading: true}));
  return activeDriversAPI.getActiveDrivers(params)
    .then(({data}) => {
      data.content = _.map(data.content, (driver) => {
        driver.driverId = driver.driver.id;
        return driver;
      });
      const onlineDrivers = Object.assign({}, data);
      return {onlineDrivers, onlineDriversParams: params, onlineDriversLoading: false};
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {onlineDrivers: null, onlineDriversLoading: false};
    });
});

const getAAADrivers = createAction(GET_AAA_DRIVERS, (dispatch, params) => {
  dispatch(loading({AAADriversLoading: true}));
  return ridesAPI.getRidesList(params)
    .then(({data}) => {
      data.content = _.map(data.content, (driver) => {
        driver.driverName = `${driver.driverFirstName} ${driver.driverLastName}`;
        driver.riderName = `${driver.riderFirstName} ${driver.riderLastName}`;
        driver.startAddress = _.get(driver, 'startAddress.address');
        driver.endAddress = _.get(driver, 'endAddress.address');
        return driver;
      });
      const AAADrivers = Object.assign({}, data);
      return {
        AAADrivers,
        AAADriversParams: params,
        AAADriversLoading: false,
      };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {AAADrivers: null, AAALoading: false};
    });
});

const getRequestedDrivers = createAction(GET_REQUESTED_DRIVERS, (dispatch, params) => {
  dispatch(loading({requestedDriversLoading: true}));
  return ridesAPI.getRidesList(params)
    .then(({data}) => {
      data.content = _.map(data.content, (driver) => {
        driver.riderName = `${driver.riderFirstName} ${driver.riderLastName}`;
        driver.startAddress = driver.startAddress ? driver.startAddress.address : null;
        return driver;
      });
      const requestedDrivers = Object.assign({}, data);
      return {
        requestedDrivers,
        requestedDriversParams: params,
        requestedDriversLoading: false,
      };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {AAADrivers: null, AAALoading: false};
    });
});

const pageChange = createAction(CHANGE_PAGE, (dispatch, params) => {
  if (params.type === 'onlineDrivers') {
    delete params.type;
    dispatch(getOnlineDrivers(dispatch, params));
  }
  if (params.type === 'AAADrivers') {
    delete params.type;
    dispatch(getAAADrivers(dispatch, params));
  }
  if (params.type === 'requestedDrivers') {
    delete params.type;
    dispatch(getRequestedDrivers(dispatch, params));
  }
});

const getDriverLocation = createAction(GET_DRIVER_LOCATION, (dispatch, driver) =>
  dispatch(commonActions.getLocation({lat: driver.lat, lng: driver.lng}))
    .then(({payload}) => {
      if (payload) return Object.assign({}, driver, {address: payload.formatted_address});
      return {};
    })
);

const cancelRide = createAction(CANCEL_RIDE, (dispatch, rideId) =>
  dispatch(rideActions.cancelRide(dispatch, rideId)));

const clear = createAction(CLEAR_ACTION, () => ({rides: {}, map: null, loading: true}));

export const actions = {
  clear,
};

export const complexActions = {
  getOnlineDrivers,
  getAAADrivers,
  getRequestedDrivers,
  pageChange,
  getDriverLocation,
  cancelRide,
};

const initialState = {
  onlineDriversLoading: true,
  onlineDriversParams: {
    page: 0,
    avatarType: 'ADMIN',
    pageSize: 100,
  },
  onlineDrivers: null,

  AAADriversLoading: true,
  AAADriversParams: {
    page: 0,
    avatarType: 'ADMIN',
    status: 'DRIVER_ASSIGNED,ACTIVE,DRIVER_REACHED',
    pageSize: 100,
  },
  AAADrivers: null,

  requestedDriversLoading: true,
  requestedDriversParams: {
    page: 0,
    avatarType: 'ADMIN',
    status: 'REQUESTED',
    pageSize: 100,
  },
  requestedDrivers: null,

  requests: {},
};

const onlineReducer = createReducer(initialState, {
  [GET_ONLINE_DRIVERS]: state => state,
  [GET_AAA_DRIVERS]: state => state,
  [GET_REQUESTED_DRIVERS]: state => state,
  [CLEAR_ACTION]: state => state,
  [LOADING]: state => state,
  [GET_DRIVER_LOCATION]: ({address, driverId, type}, state) => {
    if (driverId) {
      const drivers = state[type].content.slice();
      const driverIndex = _.findIndex(drivers, {driverId});
      const driver = _.find(drivers, {driverId});
      drivers[driverIndex] = Object.assign({}, driver, {address});
      const updatedDrivers = { [type]: Object.assign({}, state[type], {content: drivers}) };
      return updatedDrivers;
    }
    return state;
  },
});

export default onlineReducer;

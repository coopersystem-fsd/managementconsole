import { createAction, createReducer } from 'redux-action';
import { exportRidesData } from '../services/api';
import {ridesAPI} from '../services/rest';
import { handleError } from './handle-error-module';

export const STUCK_RIDES_STATUS = 'RA/RIDES/STUCK_RIDES_STATUS';
export const CANCEL_STUCK_RIDES = 'RA/RIDES/CANCEL_STUCK_RIDES';
export const GET_STUCK_RIDES = 'RA/RIDES/GET_STUCK_RIDES';
export const LOAD_RIDES_ACTION = 'RA/RIDES/LOAD_RIDES_ACTION';
export const GET_RIDES_ACTION = 'RA/RIDES/GET_RIDES_ACTION';
export const GET_RIDE_ACTION = 'RA/RIDES/GET_RIDE_ACTION';
export const SEND_CSV_ACTION = 'RA/RIDES/SEND_CSV_ACTION';
export const SEND_SERVER_REPORT_ACTION = 'RA/RIDES/SEND_SERVER_REPORT_ACTION';

function generateServerResponse(data) {
  return {
    first: true,
    firstPage: true,
    last: true,
    lastPage: true,
    number: 0,
    numberOfElements: data.length,
    size: 100,
    totalElements: data.length,
    totalPages: 1,
  };
}

const loadRideAction = createAction(LOAD_RIDES_ACTION, () => ({loading: true}));

const getRideAction = createAction(GET_RIDE_ACTION, (dispatch, rideId) =>
  ridesAPI.getRide(rideId)
    .then(({data: {
      id,
      rider = {},
      activeDriver = {driver: {}},
      requestedCarType = {},
      startedOn,
      completedOn,
      tip,
      tippedOn,
      distanceTravelled = 0,
      cancelledOn,
    }}) => {
      const carType = requestedCarType.carCategory;
      const data = Object.assign({}, {
        id,
        riderId: rider.id,
        riderFullname: rider.fullName,
        carCategory: carType === 'REGULAR' ? 'STANDARD' : carType,
        driverId: activeDriver.driver.id,
        driverFullname: activeDriver.driver.fullName,
        startedOn,
        completedOn,
        tip,
        tippedOn,
        distanceTravelled,
        cancelledOn,
      });
      return {
        data: [data],
        serverResponse: generateServerResponse([data]),
        error: false,
      };
    })
    .catch((err = {}) => {
      if (err.status !== 404) dispatch(handleError(err));
      return {
        error: true,
      };
    }));

const getRidesAction = createAction(GET_RIDES_ACTION, (dispatch,
  {
    id,
    avatarType,
    page,
    status,
    sort,
    desc,
    completedOnAfter,
    completedOnBefore,
    cancelledOnAfter,
    cancelledOnBefore,
    createdOnAfter,
    createdOnBefore,
    pageSize,
    cityId,
    format,
  } = {}) =>
    ridesAPI.getRides({
      id,
      avatarType,
      page,
      status,
      sort,
      desc,
      completedOnAfter,
      completedOnBefore,
      cancelledOnAfter,
      cancelledOnBefore,
      createdOnAfter,
      createdOnBefore,
      pageSize,
      cityId,
      format,
    })
    .then(({data, data: {content}}) => ({
      serverResponse: data,
      data: content,
      loading: false,
    }))
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        loading: false,
        error: true,
        errorMessage: err.data,
      };
    })
);

const stuckRidesStatusAction = createAction(STUCK_RIDES_STATUS, body => body);

const getStuckRidesAction = createAction(GET_STUCK_RIDES, (dispatch) => {
  dispatch(stuckRidesStatusAction({ loadingStuckRides: true }));
  return ridesAPI.getStuckRides().then((result) => {
    dispatch(stuckRidesStatusAction({ loadingStuckRides: false }));
    return result.data;
  }).catch(() => {
    dispatch(stuckRidesStatusAction({ loadingStuckRides: false }));
  });
});

const cancelStuckRidesAction =
  createAction(CANCEL_STUCK_RIDES, () => ridesAPI.cancelStuckRides().then(result => result.data));

const sendCSVAction = createAction(SEND_CSV_ACTION, (body) => {
  Object.assign(body, { avatarType: 'ADMIN' });
  return exportRidesData(body);
});

const sendServerReportAction = createAction(SEND_SERVER_REPORT_ACTION, (body) => {
  Object.assign(body, { avatarType: 'ADMIN' });
  return exportRidesData(body);
});

export const actions = {
  loadRideAction,
  sendCSVAction,
  sendServerReportAction,
  cancelStuckRides: cancelStuckRidesAction,
};

export const complexActions = {
  getStuckRides: getStuckRidesAction,
  getRideAction,
  getRidesAction,
};

const initialState = {
  loadingStuckRides: false,
  loading: true,
  serverResponse: null,
  data: null,
};

const ridesReducer = createReducer(initialState, {
  [GET_STUCK_RIDES]: (actionPayload, state) => ({...state, stuckRides: actionPayload}),
  [STUCK_RIDES_STATUS]: (actionPayload, state) => ({...state, ...actionPayload}),
  [LOAD_RIDES_ACTION]: (actionPayload, state) => ({...state, ...actionPayload}),
  [GET_RIDES_ACTION]: (actionPayload, state) => ({...state, ...actionPayload}),
  [GET_RIDES_ACTION]: state => state,
});

export default ridesReducer;

import { createAction, createReducer } from 'redux-action';
import { ridesAPI } from '../services/rest';
import { handleError } from './handle-error-module';
import { showNotification } from './notifications-module';

export const GET_RIDE_ACTION = 'RA/RIDE/GET_RIDE_ACTION';
export const CANCEL_RIDE_ACTION = 'RA/RIDE/CANCEL_RIDE_ACTION';
export const RESEND_RECEIPT_ACTION = 'RA/RIDE/RESEND_RECEIPT_ACTION';
export const GET_MAP_ACTION = 'RA/RIDE/GET_MAP_ACTION';
export const CLEAR_ACTION = 'RA/RIDE/CLEAR_ACTION';

const getMap = createAction(GET_MAP_ACTION, (dispatch, rideId) =>
  ridesAPI.getRideMap(rideId)
    .then(({data}) => ({
      map: data.url || 'no map',
      error: false,
    }))
    .catch(() =>
      ({})
    )
  );

const clear = createAction(CLEAR_ACTION, () => ({rides: {}, map: null, loading: true}));

const getRide = createAction(GET_RIDE_ACTION, (dispatch, rideId) =>
  ridesAPI.getRide(rideId)
    .then(({data: ride}) => {
      dispatch(getMap(dispatch, rideId));
      return {
        ride,
        error: false,
        loading: false,
      };
    })
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    }));

const cancelRide = createAction(CANCEL_RIDE_ACTION, (dispatch, id) =>
  ridesAPI.cancelRide({id, avatarType: 'ADMIN'})
    .then(() => {
      dispatch(showNotification('Ride was successfully canceled.'));
    })
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    }));

const resendReceipt = createAction(RESEND_RECEIPT_ACTION, (dispatch, id) =>
  ridesAPI.resendReceipt(id)
    .then(() => {
      dispatch(showNotification('Ride receipt has been sent.'));
    })
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    }));

export const actions = {clear};

export const complexActions = {
  getRide,
  getMap,
  cancelRide,
  resendReceipt,
};

const initialState = {
  loading: true,
  ride: {},
};

const ridesReducer = createReducer(initialState, {
  [GET_RIDE_ACTION]: state => state,
  [GET_MAP_ACTION]: state => state,
  [CLEAR_ACTION]: state => state,
});

export default ridesReducer;

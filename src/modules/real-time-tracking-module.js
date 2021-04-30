import { createAction, createReducer } from 'redux-action';
import { ridesAPI } from '../services/rest';
import constants from '../data/constants';

export const GET_TRACKING_DATA = 'RA/RealTimeTracking/GET_TRACKING_DATA';
export const GET_ETA = 'RA/RealTimeTracking/GET_ETA';
export const START_AUTO_FETCH = 'RA/RealTimeTracking/START_AUTO_FETCH';
export const STOP_AUTO_FETCH = 'RA/RealTimeTracking/STOP_AUTO_FETCH';
export const SET_TRACKING_KEY = 'RA/RealTimeTracking/SET_TRACKING_KEY';

const getETA = () => (dispatch, getState) => {
  const directionsService = new google.maps.DirectionsService();
  const {locations, endLocation} = getState().trackingData.data;
  const lc = _.last(locations);
  if (lc && endLocation) {
    directionsService.route({
      origin: lc,
      destination: endLocation,
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
    }, (result, status) => {
      const eta = {};

      if (status === google.maps.DirectionsStatus.OK) {
        const { duration, distance } =
        _.chain(result.routes)
        .map(v => v.legs)
        .first()
        .first()
        .value();

        eta.durationInMinutes = _.round(duration.value / 60);
        eta.distanceInKm = _.round(distance.value / 1000);
      }

      return new Promise(resolve =>
        resolve(dispatch({
          type: GET_ETA,
          payload: {eta},
        })));
    });
  }
  return new Promise(resolve =>
    resolve(dispatch({
      type: GET_ETA,
      payload: {eta: {}},
    })));
};

const getTrackingData = force => (dispatch, getState) => {
  if (force || getState().trackingData.autoFetch) {
    return ridesAPI.getCurrentRideTracking(getState().trackingData.trackingKey)
      .then(({data}) => {
        const isRideActive = constants.common.endedStatuses.indexOf(data.status) === -1;
        const isEtaEmpty = _.isEmpty(getState().trackingData.eta);

        if (isRideActive) {
          dispatch(getTrackingData());
          if (isEtaEmpty) dispatch(getETA());
        }

        dispatch({
          type: GET_TRACKING_DATA,
          payload: {data, loading: false},
        });
      })
      .catch((error) => {
        dispatch({
          type: GET_TRACKING_DATA,
          payload: {error, loading: false},
        });
      });
  }
  return new Promise(resolve => resolve(dispatch({
    type: GET_TRACKING_DATA,
    payload: {},
  })));
};

const setTrackingKey = createAction(SET_TRACKING_KEY, trackingKey =>
  new Promise(resolve => resolve({trackingKey})));

const startAutoFetch =
  createAction(START_AUTO_FETCH, (dispatch, trackingKey) => {
    dispatch(setTrackingKey(trackingKey))
      .then(() => dispatch(getTrackingData()));
    return {autoFetch: true};
  });


const stopAutoFetch =
  createAction(STOP_AUTO_FETCH, () => ({autoFetch: false}));

export const actions = {
  getTrackingData,
  getETA,
};

// Actions that need dispatch reference
export const complexActions = {
  startAutoFetch,
  stopAutoFetch,
};

const initialState = {
  loading: true,
  autoFetch: false,
  trackingKey: null,
  data: {},
  eta: {},
};

const mapReducer = createReducer(initialState, {
  [GET_TRACKING_DATA]: state => state,
  [START_AUTO_FETCH]: state => state,
  [STOP_AUTO_FETCH]: state => state,
  [SET_TRACKING_KEY]: state => state,
  [GET_ETA]: state => state,
});

export default mapReducer;

import { createAction, createReducer } from 'redux-action';
import { getRatingsByDriver, getRatingsByRider, getRatingsForDriver, getRatingsForRider, updateRatingTo, doDeleteRating, doRecalculateRating } from '../services/rest/ratings';

export const GET_DRIVER_RATINGS = 'RA/RATINGS/GET_DRIVER_RATINGS';
export const GET_RIDER_RATINGS = 'RA/RATINGS/GET_RIDER_RATINGS';
export const UPDATE_RATING = 'RA/RATINGS/UPDATE_RATING';
export const DELETE_RATING = 'RA/RATINGS/DELETE_RATING';
export const RECALC_RATING = 'RA/RATINGS/RECALC_RATING';

const getDriversRatings = createAction(GET_DRIVER_RATINGS, (forID, byID) => {
  if (!forID && !byID) {
    throw Error('One of the argument should be supplied');
  }

  let promise;
  let key;
  const id = forID || byID;
  if (forID) {
    promise = getRatingsForDriver(forID);
    key = 'for';
  } else {
    promise = getRatingsByDriver(byID);
    key = 'by';
  }

  return promise.then((result) => {
    return { data: result.data, key, id };
  });
});

const getRidersRatings = createAction(GET_RIDER_RATINGS, (forID, byID) => {
  if (!forID && !byID) {
    throw Error('One of the argument should be supplied');
  }

  let promise;
  let key;
  const id = forID || byID;
  if (forID) {
    promise = getRatingsForRider(forID);
    key = 'for';
  } else {
    promise = getRatingsByRider(byID);
    key = 'by';
  }

  return promise.then((result) => {
    return { data: result.data, key, id };
  });
});

const updateRating = createAction(UPDATE_RATING, (id, value) => {
  updateRatingTo(id, value);
});

const deleteRating = createAction(DELETE_RATING, (id) => {
  doDeleteRating(id);
});

const recalculateRating = createAction(RECALC_RATING, (id, type) => {
  doRecalculateRating(id, type);
});

export const actions = {
  getDriversRatings,
  getRidersRatings,
  updateRating,
  deleteRating,
  recalculateRating,
};

export const complexActions = {
};

const initialState = {
  riders: {
    for: {},
    by: {},
  },
  drivers: {
    for: {},
    by: {},
  },
};

export default createReducer(initialState, {
  [GET_DRIVER_RATINGS]: (actionPayload, state) => {
    const ratings = state.drivers[actionPayload.key][actionPayload.id] = actionPayload.data;
    return {...state, ratings: { ...ratings }};
  },
  [GET_RIDER_RATINGS]: (actionPayload, state) => {
    const ratings = state.riders[actionPayload.key][actionPayload.id] = actionPayload.data;
    return {...state, ratings: { ...ratings }};
  },
});

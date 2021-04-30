import { createAction, createReducer } from 'redux-action';
import {reportsAPI} from '../services/rest';
import { handleError } from './handle-error-module';

export const DEFAULT_ACTION = 'RA/Statistics/SET_LOADING';
export const DEFAULT_ASYNC_ACTION = 'DEFAULT_ASYNC_ACTION';
export const GET_REPORT = 'RA/Statistics/GET_REPORT';


const defaultAction = createAction(DEFAULT_ACTION, data => data);

const defaultAsyncAction = createAction(DEFAULT_ASYNC_ACTION, data => Promise.resolve(data));

const getReport = createAction(GET_REPORT, (dispatch, {
  reportID,
  page,
  sort,
  desc,
  pageSize,
  completedOnAfter,
  completedOnBefore,
  avatarType,
  zipCode,
  timeZoneOffset,
  cityId,
}) => {
  dispatch(defaultAction({[`${reportID}Loading`]: true}));
  return reportsAPI.getReport({
    reportID,
    page,
    sort,
    desc,
    pageSize,
    completedOnAfter,
    completedOnBefore,
    avatarType,
    zipCode,
    timeZoneOffset,
    cityId,
  })
  .then(({data: content}) => (
    {
      [`${reportID}Loading`]: false,
      [reportID]: content,
    }
  ))
  .catch((err) => {
    dispatch(defaultAction({[`${reportID}Loading`]: false}));
    dispatch(handleError(err));
  });
});


export const actions = {
  getReport,
  default: defaultAction,
  defaultAsync: defaultAsyncAction,
};

// Actions that need dispatch reference
export const complexActions = {
  getReport,
};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};


const initialState = {
  ridesReportLoading: true,
  ridesZipCodeReportLoading: true,
  driversRidesReportLoading: true,
  ridesTrackingReportLoading: true,
};

const statisticsReducer = createReducer(initialState, {
  [GET_REPORT]: state => state,
  [DEFAULT_ACTION]: state => state,
  [DEFAULT_ASYNC_ACTION]: state => state,
});

export default statisticsReducer;

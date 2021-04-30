import axios from 'axios';
import { createAction, createReducer } from 'redux-action';
import { handleError } from './handle-error-module';
import { driversAPI } from '../services/rest';
import { sendDriversEarningsPromise } from '../services/api';

export const LOADING = 'RA/Operations/LOADING';
export const DONE = 'RA/Operations/DONE';
export const GET_DRIVERS = 'RA/Operations/GET_DRIVERS';
export const SEND_DRIVER_EARNINGS = 'RA/Operations/SEND_DRIVER_EARNINGS';

const loading = createAction(LOADING, state => state);

const done = createAction(DONE, () => ({
  loading: false,
  progressCurrent: 0,
  progressTotal: 0,
}));

const sendDriversEarnings = date => (dispatch) => {
  const params = {active: true, pageSize: 100};
  let promises = [];
  let drivers = [];

  dispatch(loading({loading: true}));

  driversAPI.listDriversDto(params)
    .then(({data}) => {
      drivers = [...drivers, data.content];
      let page = data.totalPages - 1;
      while (page) {
        promises = [...promises, driversAPI.listDriversDto(Object.assign({}, params, {page}))];
        page -= 1;
      }
      dispatch({
        type: SEND_DRIVER_EARNINGS,
        payload: {
          progressTotal: data.totalElements,
          progressCurrent: 1,
        },
      });
      return axios.all(promises);
    })
    .then((responses) => {
      _.forEach(responses, ({data}) => {
        drivers = [...drivers, data.content];
      });
      let progressCurrent = 0;
      _.chain(drivers)
        .flatten()
        .forEach((driver) => {
          sendDriversEarningsPromise({id: driver.driverId, query: {date, recipient: driver.email}})
            .then(() => {
              progressCurrent += 1;
              dispatch({
                type: SEND_DRIVER_EARNINGS,
                payload: {
                  progressCurrent,
                },
              });
            });
        })
        .value();
    })
    .catch(err => dispatch(handleError(err)));
};

export const actions = {
  sendDriversEarnings,
  done,
};

// Actions that need dispatch reference
export const complexActions = {};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};

const initialState = {

};

const mapReducer = createReducer(initialState, {
  [GET_DRIVERS]: state => state,
  [SEND_DRIVER_EARNINGS]: state => state,
  [LOADING]: state => state,
  [DONE]: state => state,
});

export default mapReducer;

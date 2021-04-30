import { createAction, createReducer } from 'redux-action';
import { showNotification } from './notifications-module';
import { handleError } from './handle-error-module';
import {customPaymentsAPI} from '../services/rest';

export const LOADING_ACTION = 'RA/Payments/LOADING_ACTION';
export const LIST_PAYMENTS_ACTION = 'RA/Payments/LIST_PAYMENTS_ACTION';
export const EXPORT_PAYMENTS_ACTION = 'RA/Payments/EXPORT_PAYMENTS_ACTION';
export const ADD_PAYMENTS_ACTION = 'RA/Payments/ADD_PAYMENTS_ACTION';

const loadingAction = createAction(LOADING_ACTION, (loading = false) => ({loading}));

const listPaymentsAction = createAction(LIST_PAYMENTS_ACTION, (dispatch, params) =>
  customPaymentsAPI.listOtherPayments(params)
    .then(({data: serverResponse}) => ({
      serverResponse,
      error: false,
      loading: false,
    }))
    .catch((err) => {
      dispatch(handleError(err));
      return {error: true};
    })
);

const exportPaymentsAction = createAction(EXPORT_PAYMENTS_ACTION, (dispatch, params) =>
  customPaymentsAPI.exportPayments(params)
    .then(({data: serverResponse}) => {
      dispatch(showNotification(`Payments export was successfully sent to ${params.recipient}`));
      return {
        serverResponse,
        error: false,
        loading: false,
      };
    })
    .catch((error = {}) => {
      dispatch(handleError(error));
      return {error: error.data};
    })
);

const addPaymentsAction = createAction(ADD_PAYMENTS_ACTION, (dispatch, params) => {
  dispatch(loadingAction(true));
  params.avatarType = 'ADMIN';
  return customPaymentsAPI.addPayment(params)
          .then(({data: serverResponse}) => {
            dispatch(showNotification('Payment was successfully created'));
            return {
              serverResponse,
              error: false,
              loading: false,
            };
          })
          .catch((error = {}) => {
            dispatch(handleError(error));
            return {error: error.data};
          });
});

export const actions = {
  loading: loadingAction,
};

export const complexActions = {
  listPayments: listPaymentsAction,
  addPayments: addPaymentsAction,
  exportPayments: exportPaymentsAction,
};

const initialState = {
  loading: true,
};

const paymentsReducer = createReducer(initialState, {
  [LIST_PAYMENTS_ACTION]: state => state,
  [LOADING_ACTION]: state => state,
});

export default paymentsReducer;

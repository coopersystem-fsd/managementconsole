import { createAction, createReducer } from 'redux-action';
import { showNotification } from './notifications-module';
import {promocodesAPI} from '../services/rest';
import { handleError } from './handle-error-module';

export const GET_PROMOCODES_ACTION = 'RA/Promocodes/GET_PROMOCODES_ACTION';
export const CREATE_PROMOCODE_ACTION = 'RA/Promocodes/CREATE_PROMOCODE_ACTION';
export const UPDATE_PROMOCODE_ACTION = 'RA/Promocodes/UPDATE_PROMOCODE_ACTION';
export const GET_PROMOCODE_ACTION = 'RA/Promocodes/GET_PROMOCODE_ACTION';
export const GET_USAGE_COUNT_ACTION = 'RA/Promocodes/GET_USAGE_COUNT_ACTION';
export const LOADING_ACTION = 'RA/Promocodes/LOADING_ACTION';

const loadingAction = createAction(LOADING_ACTION, (loading = false) => ({loading}));

const getPromocodesAction = createAction(GET_PROMOCODES_ACTION, (dispatch, params) => {
  dispatch(loadingAction({loading: true}));
  return promocodesAPI.listPromocodes(params)
    .then(({data}) => ({
      loading: false,
      serverResponse: data,
      error: null,
      params,
    }))
    .catch((err) => {
      dispatch(handleError(err));
      return {
        loading: false,
        error: true,
      };
    });
});

const createPromocodeAction =
createAction(CREATE_PROMOCODE_ACTION, (dispatch, promocode) =>
  promocodesAPI.addPromocode(promocode)
    .then(() => {
      showNotification(`${promocode.codeLiteral} has been successfully created.`);
      return {
        loading: false,
        error: false,
      };
    })
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        loading: false,
        error: true,
        errorMessage: err.data,
      };
    })
);

const updatePromocodeAction =
createAction(UPDATE_PROMOCODE_ACTION, (dispatch, promocode) =>
  promocodesAPI.updatePromocode(promocode)
  .then(() => {
    showNotification(`${promocode.codeLiteral} has been successfully edited.`);
    return {
      loading: false,
      error: false,
    };
  })
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        loading: false,
        error: true,
        errorMessage: err.data,
      };
    })
);

const getPromocodeAction = createAction(GET_PROMOCODE_ACTION, (dispatch, promocodeId) =>
  promocodesAPI.getPromocode(promocodeId)
    .then(({data}) => data)
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        loading: false,
        error: true,
      };
    })
);

const getUsageCountAction = createAction(GET_USAGE_COUNT_ACTION, (dispatch, promocodeId) =>
  promocodesAPI.getUsageCount(promocodeId)
    .then(({data}) => data)
    .catch((err = {}) => {
      dispatch(handleError(err));
      return {
        loading: false,
        error: true,
      };
    })
);

export const actions = {
  loading: loadingAction,
};

export const complexActions = {
  getPromocodes: getPromocodesAction,
  createPromocode: createPromocodeAction,
  updatePromocode: updatePromocodeAction,
  getPromocode: getPromocodeAction,
  getUsageCount: getUsageCountAction,
};


const initialState = {
// Initial State goes here!
};

const promocodesReducer = createReducer(initialState, {
  [GET_PROMOCODES_ACTION]: state => state,
  [CREATE_PROMOCODE_ACTION]: state => state,
  [UPDATE_PROMOCODE_ACTION]: state => state,
  [LOADING_ACTION]: state => state,
});

export default promocodesReducer;

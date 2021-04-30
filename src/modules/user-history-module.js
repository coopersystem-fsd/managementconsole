import { createReducer } from 'redux-action';
import {driverChangesAPI} from '../services/rest';
import { handleError } from './handle-error-module';

export const LOADING = 'Ra/UserHistory/LOADING';
export const GET_USER_HISTORY = 'Ra/UserHistory/GET_USER_HISTORY';
export const CLEAR_USER_HISTORY = 'Ra/UserHistory/CLEAR_USER_HISTORY';

const initialState = {
  data: {},
  loading: true,
};

export default createReducer(initialState, {
  [LOADING]: state => state,
  [GET_USER_HISTORY]: state => state,
  [CLEAR_USER_HISTORY]: state => state,
});

export const loadingAction = isLoading => dispatch =>
  dispatch({
    type: LOADING,
    payload: {loading: isLoading},
  });

export const clear = () => dispatch =>
  dispatch({
    type: CLEAR_USER_HISTORY,
    payload: {data: {}},
  });

export const getUserHistory = (driverId, auditDay) => (dispatch) => {
  dispatch(loadingAction(true));
  driverChangesAPI.getDriverChangeHistory({driverId, auditDay})
    .then(({data}) => Promise.resolve(dispatch({
      type: GET_USER_HISTORY,
      payload: {data, loading: false},
    })))
    .catch(err => dispatch(handleError(err)));
};

export const actions = { getUserHistory, clear };

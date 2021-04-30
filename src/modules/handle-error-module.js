import { createAction, createReducer } from 'redux-action';
import {logoutAction} from './login-module';

export const HANDLE_ERROR = 'HANDLE_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export const clearError = createAction(CLEAR_ERROR, () => ({error: {}}));

export const handleError = error => (dispatch) => {
  const {status, statusText, data, message} = error;

  try {
    if (error.message) throw new Error(error);
  } catch (e) {
    const caughtError = `${e.name} ${e.message}`;
    console.error(caughtError, e); // eslint-disable-line
  }

  let errorObj;

  switch (status) {

    case 400:
    case 409:
    case 500:
      errorObj = Object.assign({}, {
        showError: true,
        errorCode: status,
        message: data,
      });
      break;

    case 401:
      errorObj = Object.assign({}, {
        showError: true,
        errorCode: status,
        message: data || statusText || message,
      });
      break;

    case 413:
      errorObj = Object.assign({}, {
        showError: true,
        errorCode: status,
        message: statusText,
      });
      break;

    case 502:
      errorObj = Object.assign({}, {
        showError: true,
        errorCode: status,
        message: 'Cannot connect to server',
      });
      break;

    case null:
      errorObj = Object.assign({}, {
        showError: false,
        errorCode: null,
        message: null,
      });
      break;

    default:
      errorObj = Object.assign({}, {
        showError: true,
        errorCode: status,
        message: statusText || message,
      });
  }

  const isUnauthorized = errorObj.errorCode === 401 || errorObj.errorCode === 403;

  if (isUnauthorized) dispatch(logoutAction());

  dispatch({
    type: HANDLE_ERROR,
    payload: {error: errorObj},
  });
};

const initialState = {
  error: {},
};

export const actions = {
  handleError,
  clearError,
};

export default createReducer(initialState, {
  [HANDLE_ERROR]: state => state,
  [CLEAR_ERROR]: state => state,
});

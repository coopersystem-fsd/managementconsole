import { createAction, createReducer } from 'redux-action';
import { resetPasswordPromise } from '../services/user';
import { showNotification } from './notifications-module';
import { handleError } from './handle-error-module';

export const FORGOT_PASSWORD_ACTION = 'FORGOT_PASSWORD_ACTION';


const forgotPasswordAction = createAction(FORGOT_PASSWORD_ACTION, (dispatch, data) => {
  const email = data.email;
  return resetPasswordPromise(email)
  .then(() => {
    dispatch(showNotification(`An email has been sent to ${email} please check your inbox and spam folder.`));
  })
  .catch(err => dispatch(handleError(err)));
});


export const actions = {};

// Actions that need dispatch reference
export const complexActions = {
  forgotPassword: forgotPasswordAction,
};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};


const initialState = {
// Initial State goes here!
};

const forgetPasswordReducer = createReducer(initialState, {
  [FORGOT_PASSWORD_ACTION]: (actionPayload, state) => ({...state, forgetPasswordSent: true}),
});

export default forgetPasswordReducer;

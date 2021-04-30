import {createAction, createReducer} from 'redux-action';

// Actions
export const SHOW_NOTIFICATION = 'RA/Notifications/SHOW_NOTIFICATION';
export const HIDE_NOTIFICATION = 'RA/Notifications/HIDE_NOTIFICATION';
export const SHOW_ERROR = 'RA/Notifications/SHOW_ERROR';

const defaultState = {showNotification: false, showError: false};

// Reducer
export default createReducer(defaultState, {
  [SHOW_NOTIFICATION]: notification => notification,
  [HIDE_NOTIFICATION]: notification => notification,
  [SHOW_ERROR]: notification => notification,
});


export const showNotification =
  createAction(SHOW_NOTIFICATION, (message, type) => ({
    showNotification: true,
    message,
    type,
  }));

export const hideNotification =
  createAction(HIDE_NOTIFICATION, () => ({
    showNotification: false,
    showError: false,
    message: null,
  }));

export const showError =
  createAction(SHOW_ERROR, message => ({
    showError: true,
    ...message,
  }));

import { createAction, createReducer } from 'redux-action';

import {notificationsAPI} from '../services/rest';
import { handleError } from './handle-error-module';
import { showNotification } from './notifications-module';

export const LOADING_ACTION = 'RA/Notifications/LOADING_ACTION';
export const LIST_NOTIFICATIONS_ACTION = 'RA/Notifications/LIST_NOTIFICATIONS_ACTION';
export const SEND_NOTIFICATION_ACTION = 'RA/Notifications/SEND_NOTIFICATION_ACTION';

const loadingNotificationsAction = createAction(LOADING_ACTION, ({loading = false}) => ({loading}));

const listNotificationsAction = createAction(LIST_NOTIFICATIONS_ACTION, (dispatch) => {
  dispatch(loadingNotificationsAction(true));
  return notificationsAPI.listTopics()
    .then(({data: topics}) => ({loading: false, topics}))
    .catch((err) => {
      dispatch(handleError(err));
      return {loading: false};
    });
});

const sendNotificationAction =
  createAction(SEND_NOTIFICATION_ACTION, (dispatch, {topicId, message}) => {
    dispatch(loadingNotificationsAction(true));
    return notificationsAPI.pushNotification({topicId, message})
    .then(() => {
      dispatch(showNotification('Push notification was successfully sent'));
      return {loading: false};
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {loading: false};
    });
  });

export const complexActions = {
  listNotifications: listNotificationsAction,
  sendNotification: sendNotificationAction,
};

const initialState = {
  loading: true,
};

export default createReducer(initialState, {
  [LOADING_ACTION]: notifications => notifications,
  [LIST_NOTIFICATIONS_ACTION]: notifications => notifications,
  [SEND_NOTIFICATION_ACTION]: notifications => notifications,
});

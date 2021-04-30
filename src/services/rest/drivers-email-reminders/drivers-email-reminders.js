import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function list() {
  const restPath = `${config().getAPI()}drivers/reminders`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function reminderContent({driverId, reminderId}) {
  const restPath = `${config().getAPI()}drivers/${driverId}/reminders/${reminderId}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function reminderHistory(reminderHistoryId) {
  const restPath = `${config().getAPI()}drivers/reminders/history/${reminderHistoryId}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function history(driverId) {
  const restPath = `${config().getAPI()}drivers/${driverId}/reminders`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function sendReminder({driverId, reminderId, subject, content}) {
  const restPath = `${config().getAPI()}drivers/${driverId}/reminders/${reminderId}`;
  const headers = getReqObject({subject, content});
  return axios.post(restPath, {}, headers);
}

export default {
  list,
  reminderHistory,
  reminderContent,
  history,
  sendReminder,
};

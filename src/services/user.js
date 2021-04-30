import axios from 'axios';
import { getItem, removeItem } from '../helpers/localstorage';
import { generateAuthToken } from '../helpers/auth';
import {getReqObject} from './api';
import config from './config';

export function login(username, password) {
  const authToken = generateAuthToken({username, password});
  const authHeader = {
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  };

  return axios.post(`${config().getAPI()}login`, {}, authHeader);
}

export function logout(changeAPI) {
  return axios
    .post(`${config().getAPI()}logout`, {}, getReqObject())
    .then(() => {
      const user = getItem('user');

      if (!changeAPI && user) removeItem(user.api);
      removeItem('user');
      return {err: null};
    })
    .catch((err) => {
      const user = getItem('user');
      if (!changeAPI && user) removeItem(user.api);
      removeItem('user');
      return {err};
    });
}

export function getUsersByType(params) {
  const url = `${config().getAPI()}${params.type}/list`;
  const data = getReqObject(params, true);
  return axios.get(url, data);
}

export function resetPasswordPromise(email) {
  return axios.post(`${config().getAPI()}forgot?email=${email}`);
}

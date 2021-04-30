import axios from 'axios';
import { getItem } from '../helpers/localstorage';
import config from './config';
import store from '../store';

export function getDefaultParams(reqParams) {
  const cityId = getItem('lastSelectedCity');
  const params = {};
  if (cityId !== '*') {
    params.cityId = cityId;
  }
  if (reqParams && ('cityId' in reqParams) && typeof reqParams.cityId === 'undefined') {
    delete reqParams.cityId;
  }
  return params;
}

/**
 * Generate request object based on params
 * with authorization header
 *
 * @param {Object} params
 * @return {Object} request object
 */
export function getReqObject(params, defaultProps = false) {
  const token = store.getState().common.token;
  if (!token) return {};

  const headers = { 'X-Auth-Token': `${token}` };
  let data = {params};
  if (defaultProps) {
    data = { params: { ...getDefaultParams(params), ...params } };
  }
  return Object.assign({}, {headers}, data);
}

export function sendDriversEarningsPromise({ query, id = ''}) {
  if (id) id = `/${id}`;
  const path = `${config().getAPI()}drivers${id}/earnings`;
  const params = getReqObject(query);
  return axios.post(path, {}, params);
}

/**
 * Set driver with status AWAY to INACTIVE
 * DELETE /rest/acdr/{id}
 *
 * @param {Number} id
 * @return {Object} promise
 */
export function setDriverOfflinePromise({id}) {
  const url = `${config().getAPI()}acdr/${id}`;
  return axios.delete(url);
}

export function sendDriversReport(body) {
  const auth = getReqObject(body);
  return axios.post(`${config().getAPI()}drivers/export`, body, auth);
}

export function sendRidersReport(body) {
  const auth = getReqObject(body);
  return axios.post(`${config().getAPI()}riders/export`, body, auth);
}

export function exportRidesData(body) {
  const url = `${config().getAPI()}rides/export`;
  const data = getReqObject(body);
  return axios.post(url, body, data);
}

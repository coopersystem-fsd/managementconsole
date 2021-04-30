import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listDrivers(params = {}) {
  const restPath = `${config().getAPI()}drivers`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

function listDriversDto(params = {}) {
  if (_.isNaN(params.cityId)) params.cityId = null;
  const restPath = `${config().getAPI()}drivers/list`;
  const headers = getReqObject(params, params.cityId);
  return axios.get(restPath, headers);
}

function listDriverStatuses({cityId}) {
  const restPath = `${config().getAPI()}drivers/statuses`;
  const headers = getReqObject({cityId});
  return axios.get(restPath, headers);
}

function listDriverStatusesPending({cityId}) {
  if (_.isNaN(cityId)) cityId = null;
  const restPath = `${config().getAPI()}drivers/statuses/pending`;
  const headers = getReqObject({cityId});
  return axios.get(restPath, headers);
}

function getDriver(params) {
  const restPath = `${config().getAPI()}drivers/${params.id}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function updateDriver(params) {
  const restPath = `${config().getAPI()}drivers/${params.id}`;
  const headers = getReqObject();
  return axios.put(restPath, params, headers);
}

function exportDrivers(params) {
  const restPath = `${config().getAPI()}drivers/export`;
  const headers = getReqObject(params);
  return axios.post(restPath, {}, headers);
}

function updateCheckrReport(id) {
  const restPath = `${config().getAPI()}drivers/${id}/checkr`;
  const headers = getReqObject();
  return axios.put(restPath, {}, headers);
}

function createCheckrReport({id, ssn}) {
  const restPath = `${config().getAPI()}drivers/${id}/checkr`;
  const headers = getReqObject({ssn});
  return axios.post(restPath, {}, headers);
}

function sendActivationEmail(id) {
  const restPath = `${config().getAPI()}drivers/${id}/activationEmail`;
  const headers = getReqObject();
  return axios.post(restPath, {}, headers);
}

function upload(driversDataCsv) {
  const restPath = `${config().getAPI()}drivers/data/upload`;
  const headers = getReqObject();
  const data = new FormData();
  data.append('driversDataCsv', driversDataCsv);
  return axios.post(restPath, data, headers);
}

function getDriversDataSample() {
  const restPath = `${config().getAPI()}drivers/data/sample`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

export function getCarTypes(params = {}) {
  const url = `${config().getAPI()}drivers/carTypes`;
  const data = getReqObject(params);
  return axios.get(url, data);
}

export function toggleWomenOnlyPromise(id, params) {
  const url = `${config().getAPI()}drivers/${id}/driverTypes`;
  const data = getReqObject(params);
  return axios.put(url, {}, data);
}

function updatePayoneerStatus() {
  const restPath = `${config().getAPI()}drivers/payoneerStatus`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function release(id) {
  const restPath = `${config().getAPI()}drivers/${id}/release`;
  const headers = getReqObject();
  return axios.post(restPath, {}, headers);
}

export function refresh(id, params) {
  const url = `${config().getAPI()}drivers/${id}/driverTypes`;
  const data = getReqObject(params);
  return axios.put(url, {}, data);
}


export default {
  getDriver,
  updateDriver,
  listDrivers,
  listDriversDto,
  listDriverStatuses,
  exportDrivers,
  listDriverStatusesPending,
  updateCheckrReport,
  createCheckrReport,
  sendActivationEmail,
  release,
  upload,
  getDriversDataSample,
  getCarTypes,
  toggleWomenOnlyPromise,
  updatePayoneerStatus,
};

import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listReports() {
  const restPath = `${config().getAPI()}reports`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function getReport(params = {}) {
  const restPath = `${config().getAPI()}reports/${params.reportID}`;
  delete params.reportID;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

export function executeReport(body, id) {
  const url = `${config().getAPI()}reports/${id}/execute`;
  const json = `"${JSON.stringify(body).replace(/"/g, '\\"')}"`;
  const auth = getReqObject(null, true);
  auth.headers['Content-Type'] = 'application/json';
  return axios.post(url, json, auth);
}

function getReportParameters(params, id) {
  const url = `${config().getAPI()}reports/${id}/parameters`;
  const data = getReqObject(params);
  return axios.get(url, data);
}

function listParameters({reportID} = {}) {
  const restPath = `${config().getAPI()}reports/${reportID}/parameters`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

/**
 * Request GET /reports/ridesZipCodeReport
 *
 * @param {Object} params
 *   @key {Date} completedOnAfter
 *   @key {Date} completedOnBefore
 *   @key {Number} zipCode
 * @return {Object} promise
 */
function ridesZipCodeReport(params) {
  const url = `${config().getAPI()}reports/ridesZipCodeReport`;
  const data = getReqObject(params);
  return axios.get(url, data);
}

function getCumulativeRidesReport(body) {
  const url = `${config().getAPI()}reports/cumulativeRidesReport`;
  const data = getReqObject(body);
  return axios.get(url, data);
}

export default {
  listReports,
  getReport,
  executeReport,
  getReportParameters,
  listParameters,
  ridesZipCodeReport,
  getCumulativeRidesReport,
};

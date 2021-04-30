import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listPromocodes(params = {}) {
  const restPath = `${config().getAPI()}promocodes`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

function addPromocode(params = {}) {
  const restPath = `${config().getAPI()}promocodes`;
  const headers = getReqObject();
  return axios.post(restPath, params, headers);
}

function getPromocode(promocodeId) {
  const restPath = `${config().getAPI()}promocodes/${promocodeId}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function getUsageCount(promocodeId) {
  const restPath = `${config().getAPI()}promocodes/${promocodeId}/usage`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function updatePromocode(params = {}) {
  const restPath = `${config().getAPI()}promocodes/${params.id}`;
  delete params.id;
  const headers = getReqObject();
  return axios.put(restPath, params, headers);
}

export default {
  listPromocodes,
  addPromocode,
  getPromocode,
  getUsageCount,
  updatePromocode,
};

import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listSurgeAreas(params) {
  const restPath = `${config().getAPI()}surgeareas`;
  const data = getReqObject(params);
  return axios.get(restPath, data);
}

function createSurgeArea({surgeArea} = {}) {
  const restPath = `${config().getAPI()}surgeareas`;
  const headers = getReqObject();
  return axios.post(restPath, surgeArea, headers);
}

function removeSurgeArea({surgeAreaId}) {
  const restPath = `${config().getAPI()}surgeareas/${surgeAreaId}`;
  const headers = getReqObject();
  return axios.delete(restPath, headers);
}

function getSurgeArea({surgeAreaId}) {
  const restPath = `${config().getAPI()}surgeareas/${surgeAreaId}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function updateSurgeArea({surgeAreaId, surgeArea = {}}) {
  const restPath = `${config().getAPI()}surgeareas/${surgeAreaId}`;
  const headers = getReqObject();
  return axios.put(restPath, surgeArea, headers);
}

function updateSurgeAreas(payload = {}) {
  const restPath = `${config().getAPI()}surgeareas`;
  const headers = getReqObject();
  return axios.put(restPath, payload, headers);
}

function updatePrioritiesFareMode(payload = {}) {
  const restPath = `${config().getAPI()}surgeareas/config`;
  const headers = getReqObject();
  return axios.patch(restPath, payload, headers);
}

function getCurrentSurgeMode({cityId}) {
  const restPath = `${config().getAPI()}surgeareas/config?cityId=${cityId}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

export default {
  listSurgeAreas,
  createSurgeArea,
  removeSurgeArea,
  getSurgeArea,
  updateSurgeArea,
  updatePrioritiesFareMode,
  getCurrentSurgeMode,
  updateSurgeAreas,
};

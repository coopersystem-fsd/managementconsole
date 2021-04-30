import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getRider(id) {
  const restPath = `${config().getAPI()}riders/${id}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function updateRider(body) {
  const restPath = `${config().getAPI()}riders/${body.id}`;
  const headers = getReqObject();
  return axios.put(restPath, body, headers);
}

function unlockRider(id) {
  const restPath = `${config().getAPI()}riders/${id}/unlock`;
  const headers = getReqObject();
  return axios.post(restPath, null, headers);
}

function resetEmail(email) {
  const restPath = `${config().getAPI()}forgot?email=${email}`;
  const headers = getReqObject();
  return axios.post(restPath, {}, headers);
}

export default {
  getRider,
  updateRider,
  unlockRider,
  resetEmail,
};

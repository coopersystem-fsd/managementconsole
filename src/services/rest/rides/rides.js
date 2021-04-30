import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getRides(params = {}) {
  const restPath = `${config().getAPI()}rides`;
  const headers = getReqObject(params, true);
  return axios.get(restPath, headers);
}

function getRidesList(params = {}) {
  const restPath = `${config().getAPI()}rides/list`;
  const headers = getReqObject(params, true);
  return axios.get(restPath, headers);
}

function getRide(id) {
  const restPath = `${config().getAPI()}rides/${id}`;
  const headers = getReqObject({avatarType: 'ADMIN'});
  return axios.get(restPath, headers);
}

function getMap() {
  const restPath = `${config().getAPI()}rides/map`;
  const headers = getReqObject(null, true);
  return axios.get(restPath, headers);
}

function getRideMap(rideId) {
  const restPath = `${config().getAPI()}rides/${rideId}/map`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

export function getStuckRides() {
  const url = `${config().getAPI()}maintenance/rides/stuck`;
  const data = getReqObject({avatarType: 'ADMIN'});
  return axios.get(url, data);
}

export function cancelStuckRides(params = {}) {
  const url = `${config().getAPI()}maintenance/rides/stuck`;
  const data = getReqObject(params);
  return axios.post(url, {avatarType: 'ADMIN'}, data);
}

function cancelRide({id, avatarType}) {
  const restPath = `${config().getAPI()}rides/${id}`;
  const headers = getReqObject({avatarType});
  return axios.delete(restPath, headers);
}

function resendReceipt(id) {
  const restPath = `${config().getAPI()}rides/${id}/receipt`;
  return axios.post(restPath, {}, getReqObject());
}

function getCurrentRideTracking(trackingKey) {
  const restPath = `${config().getAPI()}rides/${trackingKey}/allTrackers`;
  return axios.get(restPath);
}

export default {
  getRides,
  getRidesList,
  getRide,
  getMap,
  getRideMap,
  getStuckRides,
  cancelStuckRides,
  cancelRide,
  resendReceipt,
  getCurrentRideTracking,
};

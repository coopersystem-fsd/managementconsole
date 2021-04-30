import axios from 'axios';
import {getReqObject} from '../api';
import config from '../config';

export function getRatingsByDriver(id) {
  const url = `${config().getAPI()}ratingupdates/byDriver/${id}`;
  const data = getReqObject({avatarType: 'ADMIN'});
  return axios.get(url, data);
}

export function getRatingsByRider(id) {
  const url = `${config().getAPI()}ratingupdates/byRider/${id}`;
  const data = getReqObject({avatarType: 'ADMIN'});
  return axios.get(url, data);
}

export function getRatingsForDriver(id) {
  const url = `${config().getAPI()}ratingupdates/forDriver/${id}`;
  const data = getReqObject({avatarType: 'ADMIN'});
  return axios.get(url, data);
}

export function getRatingsForRider(id) {
  const url = `${config().getAPI()}ratingupdates/forRider/${id}`;
  const data = getReqObject({avatarType: 'ADMIN'});
  return axios.get(url, data);
}

export function updateRatingTo(id, rating) {
  const url = `${config().getAPI()}ratingupdates/${id}`;
  const data = getReqObject({value: rating});
  return axios.post(url, {}, data);
}

export function doDeleteRating(id) {
  const url = `${config().getAPI()}ratingupdates/${id}`;
  const data = getReqObject();
  return axios.delete(url, data);
}

export function doRecalculateRating(id, type) {
  const url = `${config().getAPI()}ratingupdates/${id}/recalculate`;
  const data = getReqObject({type});
  return axios.patch(url, {}, data);
}

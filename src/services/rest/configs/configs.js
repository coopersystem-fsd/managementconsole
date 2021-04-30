import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

export function getAllCities(params = {}) {
  const url = `${config().getAPI()}cities`;
  const data = getReqObject(params);
  return axios.get(url, data);
}

export function getBuild() {
  const restPath = `${config().getAPI()}configs/build`;
  const data = getReqObject({});
  return axios.get(restPath, data);
}

function listAppInfo(params = {}) {
  const restPath = `${config().getAPI()}configs/app/info`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

function createAppInfo(params = {}) {
  const restPath = `${config().getAPI()}configs/app/info`;
  const headers = getReqObject();
  headers.headers['Content-Type'] = 'application/json;charset=utf-8';
  headers.headers.Accept = 'application/json;charset=utf-8';
  return axios.post(restPath, JSON.stringify(params), headers);
}

function updateAppInfo(params = {}) {
  const restPath = `${config().getAPI()}configs/app/info/${params.id}`;
  const headers = getReqObject();
  headers.headers['Content-Type'] = 'application/json;charset=utf-8';
  headers.headers.Accept = 'application/json;charset=utf-8';
  return axios.put(restPath, JSON.stringify(params), headers);
}

function deleteAppInfo(id) {
  const restPath = `${config().getAPI()}configs/app/info/${id}`;
  const {headers} = getReqObject();

  return new Promise((resolve, reject) => {
    const httpRequest = new XMLHttpRequest();

    httpRequest.open('DELETE', restPath, true);

    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.setRequestHeader('X-Auth-Token', headers['X-Auth-Token']);

    httpRequest.send();

    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 204) {
          resolve(httpRequest.responseText);
        } else {
          reject(httpRequest);
        }
      }
    };
  });
}

export default {
  getAllCities,
  getBuild,
  listAppInfo,
  createAppInfo,
  updateAppInfo,
  deleteAppInfo,
};

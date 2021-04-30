import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listDriverDocuments(driverId, params = null) {
  const restPath = `${config().getAPI()}driversDocuments/${driverId}`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

function listCarDocuments(driverId, carId) {
  const restPath = `${config().getAPI()}driversDocuments/${driverId}/cars/${carId}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function addDocument({driverId, driverPhotoType, fileData, carId, cityId, validityDate}) {
  const restPath = `${config().getAPI()}driversDocuments/${driverId}`;
  const headers = getReqObject();
  const body = new FormData();
  body.append('fileData', fileData);
  body.append('cityId', cityId);
  body.append('driverPhotoType', driverPhotoType);
  if (validityDate) body.append('validityDate', validityDate);
  if (carId) body.append('carId', carId);

  return axios.post(restPath, body, headers);
}

function deleteDocument(documentId) {
  const restPath = `${config().getAPI()}driversDocuments/${documentId}`;

  return axios.delete(restPath, getReqObject({}));
}

function updateDocument(body) {
  const restPath = `${config().getAPI()}driversDocuments/${body.documentId}`;
  delete body.documentId;
  const headers = getReqObject();

  return axios.put(restPath, body, headers);
}

export default {
  updateDocument,
  deleteDocument,
  listDriverDocuments,
  listCarDocuments,
  addDocument,
};

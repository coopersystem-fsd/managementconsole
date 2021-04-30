import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function removeCar({driverId, carId} = {}) {
  const restPath = `${config().getAPI()}drivers/${driverId}/cars/${carId}`;
  const headers = getReqObject();
  return axios.delete(restPath, headers);
}

function editCar(params) {
  const restPath = `${config().getAPI()}drivers/${params.driverId}/cars/${params.carId}`;
  delete params.driverId;
  delete params.carId;
  delete params.photoURL;
  delete params.uuid;
  delete params.inspectionSticker;

  const headers = getReqObject();
  return axios.put(restPath, params, headers);
}

function addCar(params) {
  const restPath = `${config().getAPI()}drivers/${params.driverId}/cars`;
  const headers = getReqObject();
  const body = Object.assign({}, params);

  delete body.driverId;
  delete body.photo;
  delete body.insurancePhoto;
  delete body.cityId;
  delete body.photoURL;

  const car = new FormData();
  car.append('car', new Blob([JSON.stringify(body)], { type: 'application/json' }), 'car.json');

  if (params.photo) {
    car.append('photo', params.photo);
  }
  if (params.insurancePhoto) {
    car.append('insurancePhoto', params.insurancePhoto);
  }

  return axios.post(restPath, car, headers);
}

export default {
  addCar,
  editCar,
  removeCar,
};

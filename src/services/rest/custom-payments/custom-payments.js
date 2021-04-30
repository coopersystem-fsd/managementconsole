import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listOtherPayments(params) {
  const restPath = `${config().getAPI()}custompayment`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

function addPayment(params) {
  const restPath = `${config().getAPI()}drivers/${params.driverId}/custompayment`;
  delete params.driverId;
  const headers = getReqObject(params);
  return axios.post(restPath, {}, headers);
}

function exportPayments(params) {
  const restPath = `${config().getAPI()}/custompayment/report`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

export default {
  addPayment,
  listOtherPayments,
  exportPayments,
};

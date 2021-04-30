import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getActiveDrivers(params = {}) {
  const restPath = `${config().getAPI()}acdr`;
  const headers = getReqObject(params, true);
  return axios.get(restPath, headers);
}

export default {
  getActiveDrivers,
};

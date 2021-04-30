import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getDriverChangeHistory(params) {
  const restPath = `${config().getAPI()}driver-changes`;
  const headers = getReqObject(params);
  return axios.get(restPath, headers);
}

export default {
  getDriverChangeHistory,
};

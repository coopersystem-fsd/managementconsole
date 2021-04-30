import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getUser() {
  const restPath = `${config().getAPI()}users/current`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

export default {
  getUser,
};

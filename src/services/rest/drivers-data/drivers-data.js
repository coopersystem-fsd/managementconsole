import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function upload(driversDataCsv) {
  const restPath = `${config().getAPI()}drivers`;
  const headers = getReqObject();
  const data = new FormData();
  data.append('driversDataCsv', driversDataCsv);
  return axios.post(restPath, data, headers);
}

export default {
  upload,
};

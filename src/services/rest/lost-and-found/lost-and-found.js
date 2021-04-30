import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getLostAndFound(id) {
  const restPath = `${config().getAPI()}lostandfound/${id}/requests`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

export default {
  getLostAndFound,
};

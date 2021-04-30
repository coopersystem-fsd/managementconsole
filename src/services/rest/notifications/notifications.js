import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function listTopics() {
  const restPath = `${config().getAPI()}notifications`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function pushNotification({topicId, message} = {}) {
  const restPath = `${config().getAPI()}notifications/${topicId}?message=${message}`;
  const headers = getReqObject();
  return axios.post(restPath, {}, headers);
}

export default {
  listTopics,
  pushNotification,
};

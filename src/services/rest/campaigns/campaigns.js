import axios from 'axios';
import {getReqObject} from '../../api';
import config from '../../config';

function getCampaignInfo(id) {
  const restPath = `${config().getAPI()}campaigns/?for=${id}`;
  const headers = getReqObject();
  return axios.get(restPath, headers);
}

function subscribeRider(campaignId, riderId) {
  const restPath = `${config().getAPI()}campaigns/${campaignId}/subscribers?riderId=${riderId}`;
  const headers = getReqObject();
  return axios.post(restPath, {}, headers);
}

function unsubscribeRider(campaignId, riderId) {
  const restPath = `${config().getAPI()}campaigns/${campaignId}/subscribers/${riderId}`;
  const headers = getReqObject();
  return axios.delete(restPath, headers);
}

export default {
  getCampaignInfo,
  subscribeRider,
  unsubscribeRider,
};

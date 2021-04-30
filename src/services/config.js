import { setItem } from '../helpers/localstorage';
import constants from '../data/constants';
import store from '../store';

export default () => {
  let apiType = store.getState().common.activeAPI;

  function getURL() {
    const apiURL = _.find(constants.common.apis, {id: apiType}).url;
    return apiURL;
  }

  function getAPI() {
    return getURL();
  }

  function setAPI(env) {
    const index = _.find(constants.common.apis, {id: env});

    if (index) {
      apiType = index.name;
      setItem({id: 'api', value: {id: env}});
      const apiURL = getURL();
      return apiURL;
    }

    return false;
  }

  return { getAPI, setAPI };
};

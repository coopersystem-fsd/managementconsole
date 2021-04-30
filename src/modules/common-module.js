import { createAction, createReducer } from 'redux-action';
import reverseGeoCoding from '../services/geoloc';
import { setItem, getItem, removeItem } from '../helpers/localstorage';
import {driversEmailRemindersAPI, driversAPI, configs} from '../services/rest';
import { handleError } from './handle-error-module';
import { getUser } from './login-module';

export const UPDATE_CAR_TYPES = 'UPDATE_CAR_TYPES';
export const UPDATE_CITIES = 'UPDATE_CITIES';
export const CITY_CHANGED = 'CITY_CHANGED';
export const GET_BUILD_VERSION = 'GET_BUILD_VERSION';
export const GET_EMAIL_TEMPLATES = 'GET_EMAIL_TEMPLATES';
export const GET_LOCATION = 'GET_LOCATION';
export const CHANGE_API = 'CHANGE_API';
export const SET_TOKEN = 'SET_TOKEN';
export const SET_API = 'SET_API';

const cityChanged = createAction(CITY_CHANGED, (cityId) => {
  setItem({id: 'lastSelectedCity', value: cityId});
  return {selectedCity: cityId};
});

export const setToken = token => (dispatch, getState) => {
  const activeAPI = getState().common.activeAPI;
  if (token) {
    setItem({id: activeAPI, value: token});
  } else {
    removeItem(activeAPI);
  }
  return new Promise(resolve => resolve(
    dispatch({
      type: SET_TOKEN,
      payload: {token},
    })
  ));
};

export const setAPI = api => (dispatch) => {
  if (api) {
    setItem({id: 'activeAPI', value: api});
  } else {
    removeItem('activeAPI');
  }
  return Promise.resolve(dispatch({
    type: SET_API,
    payload: {activeAPI: api},
  }));
};

export const changeAPI = api => (dispatch, getState) => {
  if (api !== getState().common.activeAPI) {
    const apiCred = getItem(api);
    return dispatch(setAPI(api))
        .then(() => dispatch(setToken(apiCred)))
        .then(() => dispatch(getUser()))
        .catch(err => dispatch(handleError(err)));
  }
  return Promise.reject();
};

const updateCarTypes = createAction(UPDATE_CAR_TYPES, dispatch =>
  driversAPI.getCarTypes()
    .then(({data}) => {
      const types = data || [];
      const map = {};
      types.forEach((type) => {
        map[type.carCategory] = type;
      });
      map.allItems = types;
      return {carTypesMap: map};
    })
    .catch(err => dispatch(handleError(err)))
);

export const getBuildVersion = createAction(GET_BUILD_VERSION, dispatch =>
  configs.getBuild()
    .then((response) => {
      const buildVersion = response.data || [];
      return {buildVersion};
    })
    .catch(err => dispatch(handleError(err)))
);

export const getEmailTemplates = createAction(GET_EMAIL_TEMPLATES, dispatch =>
    driversEmailRemindersAPI.list()
      .then(({data: emailReminders}) => ({emailReminders}))
      .catch(err => dispatch(handleError(err)))
);

export const updateCities = createAction(UPDATE_CITIES, dispatch =>
    configs.getAllCities()
      .then(({data}) => {
        const cities = _.map(data, (city) => {
          if (city.id === 2) {
            _.set(city, 'areaGeometry.centerPointLat', 29.7604267);
            _.set(city, 'areaGeometry.centerPointLng', -95.3698028);
          }
          return city;
        });
        return {cities};
      })
      .catch(err => dispatch(handleError(err)))
);

export const getLocation = createAction(GET_LOCATION, latLng =>
  reverseGeoCoding(latLng)
    .then(({data: {results, status}}) => {
      if (status === 'OK') return _.first(results);
      return Promise.reject(status);
    })
    .catch(err => Promise.reject(err))
);

export const actions = {
  cityChanged,
  getLocation,
  changeAPI,
  setToken,
};

export const complexActions = {
  updateCarTypes,
};

export const allActions = {
  ...actions,
  ...complexActions,
};

export const loggedBootstrapActions = [
  updateCarTypes,
  updateCities,
  getBuildVersion,
  getEmailTemplates,
];

// This method will run after login is complete.
// The main goal of it is dispatch all actions that require authentication.
export const runLoggedBootstrap = dispatch =>
  _.map(loggedBootstrapActions, action => dispatch(action(dispatch)));


export const initCity = () => {
  let selectedCity = 1;
  try {
    const localSC = getItem('lastSelectedCity');
    selectedCity = parseInt(localSC, 10);
    if (isNaN(selectedCity)) {
      setItem({id: 'lastSelectedCity', value: 1});
      selectedCity = 1;
    }
  } catch (err) {
    setItem({id: 'lastSelectedCity', value: 1});
    selectedCity = 1;
  }
  return selectedCity;
};

export const initActiveAPI = (isProduction, hostname) => {
  const storedAPI = getItem('activeAPI');
  let activeAPI = isProduction ? 'api' : storedAPI || 'api-rc';
  const isRC = _.first(hostname) === 'console-rc' && isProduction;
  if (isRC) activeAPI = 'api-rc';
  const token = getItem(activeAPI);
  return {activeAPI, token};
};

const {activeAPI, token} = initActiveAPI(NODE_ENV === 'production', window.location.hostname.split('.'));

const initialState = {
  selectedCity: initCity(),
  buildVersion: {},
  activeAPI,
  token,
};

const usersReducer = createReducer(initialState, {
  [CITY_CHANGED]: city => city,
  [UPDATE_CAR_TYPES]: carTypesMap => carTypesMap,
  [GET_BUILD_VERSION]: buildVersion => buildVersion,
  [UPDATE_CITIES]: cities => cities,
  [GET_EMAIL_TEMPLATES]: state => state,
  [SET_TOKEN]: state => state,
  [SET_API]: state => state,
});

export default usersReducer;

import {mock, mockStore} from '../../helpers/test-helpers';
import getCarTypes from '../__mocks__/getCarTypes.json';
import reducer, {
  actions as commonActions,
  complexActions,
  setToken,
  CITY_CHANGED,
  UPDATE_CAR_TYPES,
  UPDATE_CITIES,
  GET_BUILD_VERSION,
  GET_EMAIL_TEMPLATES,
  SET_TOKEN,
  SET_API,
  runLoggedBootstrap,
  loggedBootstrapActions,
  initActiveAPI,
  changeAPI,
  setAPI,
  getBuildVersion,
  getEmailTemplates,
  updateCities,
  getLocation,
} from '../common-module';


import * as api from '../../services/api';
import * as localstorage from '../../helpers/localstorage';
import * as config from '../../services/config';

api.getReqObject = jest.fn(params => params);

config.default = () => ({ getAPI: () => '/rest/' });

let store;
let state;

localstorage.removeItem = jest.fn();
localstorage.setItem = jest.fn();
localstorage.getItem = jest.fn();

describe('common-module', () => {
  beforeEach(() => {
    mock.reset();
    state = reducer(undefined, {common: {}});
    store = mockStore({common: state});
  });

  describe('actions', () => {
    describe('initActiveAPI', () => {
      it('return activeAPI and token', () => {
        const {activeAPI} = initActiveAPI();
        expect(activeAPI).toBe(state.activeAPI);
        expect(localstorage.getItem).toHaveBeenCalledWith(state.activeAPI);
      });
      it('return activeAPI api-rc', () => {
        const {activeAPI} = initActiveAPI(true, 'console-rc.rideaustin.com'.split('.'));
        expect(activeAPI).toBe('api-rc');
        expect(localstorage.getItem).toHaveBeenCalled();
      });
      it('return activeAPI api', () => {
        const {activeAPI} = initActiveAPI(true, 'console.rideaustin.com'.split('.'));
        expect(activeAPI).toBe('api');
        expect(localstorage.getItem).toHaveBeenCalledWith('api');
      });
      it('return stored api', () => {
        localstorage.getItem = jest.fn(() => 'storedAPI');
        const {activeAPI} = initActiveAPI(false, 'console.rideaustin.com'.split('.'));
        expect(activeAPI).toBe('storedAPI');
        expect(localstorage.getItem).toHaveBeenCalled();
      });
    });
    describe('runLoggedBootstrap', () => {
      it('run actions', () => {
        config.getBuild = () => new Promise(r => r());
        mock.onGet('/rest/drivers/carTypes').reply(200, []);
        mock.onGet('/rest/cities').reply(200, []);
        mock.onGet('/rest/configs/build').reply(200, []);
        mock.onGet('/rest/drivers/reminders').reply(200, []);
        const promises = runLoggedBootstrap(store.dispatch);
        expect(promises.length).toBe(loggedBootstrapActions.length);
        return Promise.all(promises)
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_CAR_TYPES})).toBeDefined();
            expect(_.find(actions, {type: UPDATE_CITIES})).toBeDefined();
            expect(_.find(actions, {type: GET_BUILD_VERSION})).toBeDefined();
            expect(_.find(actions, {type: GET_EMAIL_TEMPLATES})).toBeDefined();
          });
      });
    });
    describe('setToken', () => {
      it('remove token', () =>
        store.dispatch(setToken())
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SET_TOKEN})).toBeDefined();
            state = reducer(state, {type: SET_TOKEN, payload: _.last(actions).payload});
            expect(state.token).toBe(undefined);
            expect(localstorage.removeItem).toHaveBeenCalledWith(state.activeAPI);
          })
      );
      it('set token', () =>
        store.dispatch(setToken('newToken'))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SET_TOKEN})).toBeDefined();
            state = reducer(state, {type: SET_TOKEN, payload: _.last(actions).payload});
            expect(state.token).toBe('newToken');
            expect(localstorage.setItem).toHaveBeenCalledWith({id: state.activeAPI, value: 'newToken'});
          })
      );
    });
    describe('setAPI', () => {
      it('remove activeAPI', () =>
        store.dispatch(setAPI())
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SET_API})).toBeDefined();
            state = reducer(state, {type: SET_API, payload: _.last(actions).payload});
            expect(state.activeAPI).toBe(undefined);
            expect(localstorage.removeItem).toHaveBeenCalled();
          })
      );
      it('set activeAPI', () =>
        store.dispatch(setAPI('newAPI'))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SET_API})).toBeDefined();
            state = reducer(state, {type: SET_API, payload: _.last(actions).payload});
            expect(state.activeAPI).toBe('newAPI');
            expect(localstorage.setItem).toHaveBeenCalled();
          })
      );
    });
    describe('cityChanged', () => {
      it('change city', () =>
        store.dispatch(commonActions.cityChanged('something new'))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: CITY_CHANGED})).toBeDefined();
            expect(_.last(actions).payload).toEqual({selectedCity: 'something new'});
            state = reducer(state, {type: CITY_CHANGED, payload: _.last(actions).payload});
            expect(state.selectedCity).toBe('something new');
          })
      );
    });

    describe('changeAPI', () => {
      it('fail to change api without value', () =>
        store.dispatch(changeAPI())
          .then(() => {
            expect(true).toBe(false);
          })
          .catch(() => {
            expect(true).toBe(true);
          })
      );
    });

    describe('updateCarTypes', () => {
      it('update car types', () => {
        mock.onGet('/rest/drivers/carTypes').reply(200, getCarTypes);
        return store.dispatch(complexActions.updateCarTypes(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_CAR_TYPES})).toBeDefined();
            state = reducer(state, {type: UPDATE_CAR_TYPES, payload: _.last(actions).payload});
          });
      });
    });

    describe('getBuildVersion', () => {
      it('get build version', () => {
        mock.onGet('/rest/configs/build').reply(200, 'new buildversion');
        return store.dispatch(getBuildVersion(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: GET_BUILD_VERSION})).toBeDefined();
            state = reducer(state, {type: GET_BUILD_VERSION, payload: _.last(actions).payload});
            expect(state.buildVersion).toBe('new buildversion');
          });
      });
    });

    describe('getEmailTemplates', () => {
      it('get email templates', () => {
        mock.onGet('/rest/drivers/reminders').reply(200, 'bunch of email templates');
        return store.dispatch(getEmailTemplates(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: GET_EMAIL_TEMPLATES})).toBeDefined();
            state = reducer(state, {type: GET_EMAIL_TEMPLATES, payload: _.last(actions).payload});
            expect(state.emailReminders).toBe('bunch of email templates');
          });
      });
    });

    describe('updateCities', () => {
      it('get email templates', () => {
        mock.onGet('/rest/cities').reply(200, [{id: 1, name: 'city1'}, {id: 2, name: 'city2'}]);
        return store.dispatch(updateCities(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_CITIES})).toBeDefined();
            state = reducer(state, {type: UPDATE_CITIES, payload: _.last(actions).payload});
            expect(state.cities.length).toBe(2);
            expect(_.get(state.cities[1], 'areaGeometry.centerPointLat')).toBeDefined();
            expect(_.get(state.cities[1], 'areaGeometry.centerPointLng')).toBeDefined();
          });
      });
    });

    describe('getLocation', () => {
      it('fail to get location from lat lng', () => {
        const lat = 1;
        const lng = 2;
        mock.onGet(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`).reply(200, {status: 'OK', results: ['heya']});
        return store.dispatch(getLocation())
          .catch((err) => {
            expect(err).toBeDefined();
          });
      });
      it('get location from lat lng', () => {
        const lat = 1;
        const lng = 2;
        mock.onGet(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`).reply(200, {status: 'OK', results: ['heya']});
        return store.dispatch(getLocation({lat, lng}))
          .then((res) => {
            expect(res.payload).toBe('heya');
          });
      });
    });
  });
});

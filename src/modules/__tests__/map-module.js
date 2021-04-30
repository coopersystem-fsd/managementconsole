import {mock, mockStore} from '../../helpers/test-helpers';
import mockResponses from '../__mocks__/';
import reducer, {
  actions as mapActions,
  complexActions,
  GET_USERS_MAP_ACTION,
  START_USERS_POLLING_ACTION,
  SET_DRIVER_OFFLINE_ACTION,
} from '../map-module';

import * as api from '../../services/api';
import * as errorActions from '../handle-error-module';

api.getReqObject = jest.fn(params => params);

jest.mock('../../services/config', () => () => ({ getAPI: () => '/rest/' }));

let store;
let state;

describe('map-module', () => {
  beforeEach(() => {
    mock.reset();
    state = reducer(undefined, {});
    store = mockStore({map: state});
  });
  describe('actions', () => {
    describe('startUsersPolling', () => {
      it('start user polling', () => {
        store.dispatch(complexActions.startUsersPolling(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: START_USERS_POLLING_ACTION})).toBeDefined();
            expect(_.last(actions).payload).toEqual({autoFetch: true});
          });
      });
    });
    describe('stopUsersPollingAction', () => {
      it('stop user polling', () =>
        store.dispatch(mapActions.stopUsersPolling())
          .then(() => {
            const actions = store.getActions();
            expect(_.last(actions).payload).toEqual({autoFetch: false});
          })
      );
    });
    describe('setDriverOfflineAction', () => {
      it('set a driver offline', () => {
        // mock API responses
        mock.onDelete('/rest/acdr/1').reply(200);

        return store.dispatch(complexActions.setDriverOffline(store.dispatch, {driverId: 1, id: 2}))
          .then(() => {
            const actions = store.getActions();

            // Expected actions
            expect(_.find(actions, {type: SET_DRIVER_OFFLINE_ACTION})).toBeDefined();
            expect(_.last(actions).payload.payload.id).toEqual(2);
          });
      });
      it('fail to get list of users', () => {
        errorActions.handleError = jest.fn(() => () => ({}));

        // mock API responses
        mock.onGet('/rest/rides/map').reply(500, mockResponses.getMap);

        return store.dispatch(complexActions.getUsersMap(store.dispatch, true))
          .then(() => {
            expect(errorActions.handleError).toHaveBeenCalled();
          });
      });
    });
    describe('getUsersMapAction', () => {
      it('get list of users', () => {
        // mock API responses
        mock.onGet('/rest/rides/map').reply(200, mockResponses.getMap);

        return store.dispatch(complexActions.getUsersMap(true))
          .then(() => {
            const actions = store.getActions();
            state = reducer(state, {type: GET_USERS_MAP_ACTION, payload: _.last(actions).payload});
            // Expected actions
            expect(_.find(actions, {type: GET_USERS_MAP_ACTION})).toBeDefined();

            expect(state.users.length).toBe(7);
          });
      });
      it('stop getting list of users', () => {
        mock.reset();
        state.autoFetch = false;
        store = mockStore({map: state});

        // mock API responses
        mock.onGet('/rest/rides/map').reply(200, mockResponses.getMap);

        store.dispatch(complexActions.getUsersMap())
          .then(() => {
            const actions = store.getActions();
            // Expected actions
            expect(_.find(actions, {type: GET_USERS_MAP_ACTION})).toBeDefined();
            expect(_.last(actions).payload.users).toBe([]);
          });
      });
      it('fail to get list of users', () => {
        errorActions.handleError = jest.fn(() => () => ({}));

        // mock API responses
        mock.onGet('/rest/rides/map').reply(500, mockResponses.getMap);

        return store.dispatch(complexActions.getUsersMap(store.dispatch, true))
          .then(() => {
            expect(errorActions.handleError).toHaveBeenCalled();
          });
      });
    });
  });
});

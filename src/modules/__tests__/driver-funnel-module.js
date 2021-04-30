import {mock, mockStore} from '../../helpers/test-helpers';
import driverCarDocuments from '../__mocks__/driverDocuments.json';
import updateCarDocumentStatus from '../__mocks__/updateCarDocumentStatus.json';
import updateDriverDocument from '../__mocks__/updateDriverDocument.json';
import getDriver from '../__mocks__/getDriver.json';
import reducer, {
  complexActions,
  exportDriversAction,

  updateCarDocumentStatusAction,
  updateDriverDocumentAction,
  updateDriverAction,

  LIST_USERS_ACTION,
  REFRESH_STATUSES_ACTION,
  LOADING_ACTION,
  UPDATE_CAR_STATUS_ACTION,
  UPDATE_CAR_DOCUMENT_STATUS_ACTION,
  EXPORT_DRIVERS_ACTION,
  UPDATE_DRIVER_DOCUMENT_ACTION,
  UPDATE_DRIVER_ACTION,

} from '../driver-funnel-module';
import { SHOW_NOTIFICATION } from '../notifications-module';

import constants from '../../data/constants';
import * as api from '../../services/api';

import * as errorActions from '../handle-error-module';

const mockResponses = {
  listDriversDto: {
    content: [{id: 1, firstName: 'Joe', lastName: 'Doe'}],
  },
  listDriverStatusesPending: {
    [constants.driverFunnel.mapPendingFiltersToStatuses[0].id]: 100,
    [constants.driverFunnel.mapPendingFiltersToStatuses[1].id]: 200,
    [constants.driverFunnel.mapPendingFiltersToStatuses[2].id]: 50,
  },
};

api.getReqObject = jest.fn(params => params);

jest.mock('../../services/config', () => () => ({ getAPI: () => '/rest/' }));

let store;
let state;

describe('driver-funnel-module', () => {
  beforeEach(() => {
    mock.reset();
    state = reducer(undefined, {documents: {}});
    store = mockStore({document: state});
  });
  describe('actions', () => {
    describe('updateDriverAction', () => {
      it('update driver', () => {
        const params = Object.assign({}, getDriver, {
          user: {driverId: getDriver.id},
          status: {activationStatus: 'ACTIVE'},
          statusName: 'Activation Status',
        });
        // mock API responses
        mock.onGet('/rest/drivers/3610').reply(200, getDriver);
        mock.onPut('/rest/drivers/3610').reply(200);
        return store.dispatch(updateDriverAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_DRIVER_ACTION})).toBeDefined();
            expect(_.find(actions, {type: SHOW_NOTIFICATION})).toBeDefined();
          });
      });
      it('fail to update driver', () => {
        const params = Object.assign({}, getDriver, {
          user: {driverId: getDriver.id},
          status: {activationStatus: 'ACTIVE'},
        });
        // mock API responses
        mock.onGet('/rest/drivers/3610').reply(500);
        return store.dispatch(updateDriverAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: errorActions.HANDLE_ERROR})).toBeDefined();
            expect(_.find(actions, {type: UPDATE_DRIVER_ACTION})).toBeDefined();
          });
      });
    });
    describe('exportDriversAction', () => {
      it('export drivers', () => {
        // mock API responses
        mock.onPost('/rest/drivers/export').reply(200);
        return store.dispatch(exportDriversAction(store.dispatch, {}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: EXPORT_DRIVERS_ACTION})).toBeDefined();
            state = reducer(state,
              {type: EXPORT_DRIVERS_ACTION, payload: _.last(actions).payload});
          });
      });
      it('fail to export drivers', () => {
        // mock API responses
        mock.onPost('/rest/drivers/export').reply(500);
        return store.dispatch(exportDriversAction(store.dispatch, {}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: errorActions.HANDLE_ERROR})).toBeDefined();
          });
      });
    });
    describe('updateDriverDocumentAction', () => {
      it('update driver document', () => {
        const params = {
          user: {driverId: 1},
          type: 'TNC_CARD',
          newStatus: 'APPROVED',
          status: {name: 'TNC Card', value: 'Approved'},
        };
        // mock API responses
        mock.onGet('/rest/driversDocuments/1').reply(200, driverCarDocuments);
        mock.onPut('/rest/driversDocuments/12161').reply(200, updateDriverDocument);
        return store.dispatch(updateDriverDocumentAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_DRIVER_DOCUMENT_ACTION})).toBeDefined();
            expect(_.find(actions, {type: SHOW_NOTIFICATION})).toBeDefined();
          });
      });
      it('fail to update driver document that does not exist', () => {
        const params = {
          user: {driverId: 1},
          type: 'UNKNON_TYPE',
          newStatus: 'APPROVED',
          status: {name: 'TNC Card', value: 'Approved'},
        };
        // mock API responses
        mock.onGet('/rest/driversDocuments/1').reply(200, driverCarDocuments);
        mock.onPut('/rest/driversDocuments/12161').reply(200, updateDriverDocument);
        return store.dispatch(updateDriverDocumentAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_DRIVER_DOCUMENT_ACTION})).toBeDefined();
            expect(_.find(actions, {type: SHOW_NOTIFICATION})).toBeDefined();
          });
      });
      it('fail to update driver document', () => {
        const params = {
          user: {driverId: 1},
          type: 'UNKNON_TYPE',
          newStatus: 'APPROVED',
          status: {name: 'TNC Card', value: 'Approved'},
        };
        // mock API responses
        mock.onGet('/rest/driversDocuments/1').reply(500, []);
        return store.dispatch(updateDriverDocumentAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: errorActions.HANDLE_ERROR})).toBeDefined();
          });
      });
    });
    describe('updateCarDocumentStatusAction', () => {
      it('update car document', () => {
        // mock API responses
        mock.onGet('/rest/driversDocuments/1/cars/1').reply(200, driverCarDocuments);
        mock.onPut('/rest/driversDocuments/12161').reply(200, updateCarDocumentStatus);

        const params = {
          user: {driverId: 1},
          car: {id: 1},
          type: 'TNC_CARD',
          filter: {id: 'carPhotosStatus'},
          statusValue: 'APPROVED',
          cityId: 1,
        };

        return store.dispatch(updateCarDocumentStatusAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_CAR_DOCUMENT_STATUS_ACTION})).toBeDefined();
            expect(_.find(actions, {type: SHOW_NOTIFICATION})).toBeDefined();
            state = reducer(state,
              {type: UPDATE_CAR_DOCUMENT_STATUS_ACTION, payload: _.last(actions).payload});
          });
      });

      it('fail to update car document with unknown type', () => {
        // mock API responses
        mock.onGet('/rest/driversDocuments/1/cars/1').reply(200, driverCarDocuments);
        mock.onPut('/rest/driversDocuments/12161').reply(200, updateCarDocumentStatus);

        const params = {
          user: {driverId: 1},
          car: {id: 1},
          type: 'UNKNOWN TYPE',
          filter: {id: 'carPhotosStatus'},
          statusValue: 'APPROVED',
          cityId: 1,
        };

        return store.dispatch(updateCarDocumentStatusAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_CAR_DOCUMENT_STATUS_ACTION})).toBeDefined();
            expect(_.find(actions, {type: SHOW_NOTIFICATION})).toBeDefined();
            state = reducer(state,
              {type: UPDATE_CAR_DOCUMENT_STATUS_ACTION, payload: _.last(actions).payload});
          });
      });
      it('fail to update car document', () => {
        // mock API responses
        mock.onGet('/rest/driversDocuments/1/cars/1').reply(500, driverCarDocuments);

        const params = {
          user: {driverId: 1},
          car: {id: 1},
          type: 'UNKNOWN TYPE',
          filter: {id: 'carPhotosStatus'},
          statusValue: 'APPROVED',
          cityId: 1,
        };

        return store.dispatch(updateCarDocumentStatusAction(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: errorActions.HANDLE_ERROR})).toBeDefined();
          });
      });
    });

    describe('listUsers', () => {
      it('get list of users', () => {
        // mock API responses
        mock.onGet('/rest/drivers/list').reply(200, mockResponses.listDriversDto);
        mock.onGet('/rest/drivers/statuses/pending').reply(200, mockResponses.listDriverStatusesPending);

        return store.dispatch(complexActions.listUsers(store.dispatch, {}))
          .then(() => {
            const actions = store.getActions();
            // Expected actions
            expect(_.find(actions, {type: LIST_USERS_ACTION})).toBeDefined();
            expect(_.find(actions, {type: REFRESH_STATUSES_ACTION})).toBeDefined();
            expect(_.find(actions, {type: LOADING_ACTION})).toBeDefined();

            // LOADING_ACTION
            expect(actions[0].payload.loading).toBe(true);

            // REFRESH_STATUSES_ACTION
            expect(actions[1].payload.funnel[0].drivers).toEqual(200);
            expect(actions[1].payload.funnel[2].drivers).toEqual(50);

            // LIST_USERS_ACTION
            expect(actions[2].payload.serverResponse).toEqual(mockResponses.listDriversDto);
            expect(actions[2].payload.users).toEqual(mockResponses.listDriversDto.content);
            expect(actions[2].payload.loading).toBe(false);
            expect(actions[2].payload.error).toBe(false);
          });
      });
      it('fail to get list of users', () => {
        errorActions.handleError = jest.fn(() => () => ({}));

        // mock API responses
        mock.onGet('/rest/drivers/list').reply(500, mockResponses.listDriversDto);
        mock.onGet('/rest/drivers/statuses/pending').reply(200, mockResponses.listDriverStatusesPending);

        return store.dispatch(complexActions.listUsers(store.dispatch, {silent: true}))
          .then(() => {
            const actions = store.getActions();
            // Expected actions
            const listUsersAction = _.find(actions, {type: LIST_USERS_ACTION});
            expect(listUsersAction).toBeDefined();
            expect(_.find(actions, {type: REFRESH_STATUSES_ACTION})).toBeDefined();

            // LOADING_ACTION
            expect(listUsersAction.payload.error).toBe(true);
          });
      });
    });
    describe('updateCarStatus', () => {
      it('update car status', () => {
        const params = {
          user: {
            driverId: 1,
            firstName: 'John',
            lastName: 'Snow',
          },
          car: {
            id: 2,
            make: 'Tesla',
            model: 'III',
          },
          statusName: 'Insurance',
          statusValue: 'Approved',
        };

        mock.onAny().reply(200, mockResponses.listDriversDto);

        return store.dispatch(complexActions.updateCarStatus(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SHOW_NOTIFICATION})).toBeDefined();
            expect(_.find(actions, {type: UPDATE_CAR_STATUS_ACTION})).toBeDefined();
            expect(_.find(actions, {type: UPDATE_CAR_STATUS_ACTION}).payload.error).toBe(false);
          });
      });
      it('fail to update car status', () => {
        const params = {
          user: {
            driverId: 1,
            firstName: 'John',
            lastName: 'Snow',
          },
          car: {
            id: 2,
            make: 'Tesla',
            model: 'III',
          },
          statusName: 'Insurance',
          statusValue: 'Approved',
        };

        mock.onAny().reply(500, mockResponses.listDriversDto);

        return store.dispatch(complexActions.updateCarStatus(store.dispatch, params))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: UPDATE_CAR_STATUS_ACTION})).toBeDefined();
            expect(_.find(actions, {type: UPDATE_CAR_STATUS_ACTION}).payload.error).toBe(true);
          });
      });
    });
  });
});

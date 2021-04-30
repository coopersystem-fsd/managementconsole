import {mock, mockStore} from '../../helpers/test-helpers';
import driverDocuments from '../__mocks__/driverDocuments.json';
import driverCarDocuments from '../__mocks__/driverCarDocuments.json';
import addDriverDocument from '../__mocks__/addDriverDocument.json';
import updateDriverDocument from '../__mocks__/updateDriverDocument.json';
import reducer, {
  DELETE_DOCUMENT_ACTION,
  SAVE_DOCUMENT_ACTION,
  GET_CAR_DOCUMENTS_ACTION,
  GET_DOCUMENTS_ACTION,

  getDocumentsAction,
  getCarDocumentsAction,
  saveDocumentAction,
  deleteDocumentAction,
} from '../document-module';

import * as api from '../../services/api';
import * as config from '../../services/config';

api.getReqObject = jest.fn(params => params);

config.default = () => ({ getAPI: () => '/rest/' });

let store;
let state;

describe('common-module', () => {
  beforeEach(() => {
    mock.reset();
    state = reducer(undefined, {documents: {}});
    store = mockStore({document: state});
  });

  describe('actions', () => {
    describe('getDocumentsAction', () => {
      it('get list of driver documents', () => {
        mock.onGet('/rest/driversDocuments/1').reply(200, driverDocuments);
        return store.dispatch(getDocumentsAction({userId: 1}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: GET_DOCUMENTS_ACTION})).toBeDefined();
            state = reducer(state,
              {type: GET_DOCUMENTS_ACTION, payload: _.last(actions).payload});
            expect(state.all.length).toBe(3);
            expect(state.users[1]).toBeDefined();
          });
      });
    });
    describe('getCarDocumentsAction', () => {
      it('get list of driver car documents', () => {
        mock.onGet('/rest/driversDocuments/1/cars/1').reply(200, driverCarDocuments);
        return store.dispatch(getCarDocumentsAction({userId: 1, carId: 1}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: GET_CAR_DOCUMENTS_ACTION})).toBeDefined();
            state = reducer(state,
              {type: GET_CAR_DOCUMENTS_ACTION, payload: _.last(actions).payload});
            expect(state[1]).toBeDefined();
          });
      });
    });
    describe('saveDocumentAction', () => {
      it('add a document', () => {
        mock.onPost('/rest/driversDocuments/1').reply(200, addDriverDocument);
        return store.dispatch(saveDocumentAction({userId: 1, carId: 1}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SAVE_DOCUMENT_ACTION})).toBeDefined();
            state = reducer(state,
              {type: SAVE_DOCUMENT_ACTION, payload: _.last(actions).payload});
            expect(state.actionPayload.id).toBeDefined();
            expect(state.actionPayload.user).toBeDefined();
          });
      });
      it('update a document', () => {
        mock.onPut('/rest/driversDocuments/1').reply(200, updateDriverDocument);
        return store.dispatch(saveDocumentAction({id: 1, documentId: 1}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: SAVE_DOCUMENT_ACTION})).toBeDefined();
            state = reducer(state,
              {type: SAVE_DOCUMENT_ACTION, payload: _.last(actions).payload});
            expect(state.actionPayload).toBeDefined();
          });
      });
    });
    describe('deleteDocumentAction', () => {
      it('delete a document', () => {
        mock.onDelete('/rest/driversDocuments/1').reply(200);
        return store.dispatch(deleteDocumentAction(1))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: DELETE_DOCUMENT_ACTION})).toBeDefined();
            state = reducer(state,
              {type: DELETE_DOCUMENT_ACTION, payload: _.last(actions).payload});
          });
      });
    });
  });
});

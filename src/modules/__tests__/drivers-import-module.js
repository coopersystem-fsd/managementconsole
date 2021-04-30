import {mock, mockStore} from '../../helpers/test-helpers';
import reducer, {
  LOADING_ACTION,
  UPLOAD_ACTION,
  GET_SAMPLE_ACTION,

  loadingAction,
  uploadAction,
  getSampleAction,
} from '../drivers-import-module';

import * as api from '../../services/api';

import * as errorActions from '../handle-error-module';

api.getReqObject = jest.fn(params => params);
jest.mock('browser-filesaver');
jest.mock('../../services/config', () => () => ({ getAPI: () => '/rest/' }));

let store;
let state;

describe('drivers-import-module', () => {
  beforeEach(() => {
    mock.reset();
    state = reducer(undefined, {driversImport: {}});
    store = mockStore({driversImport: state});
  });
  describe('actions', () => {
    describe('loadingAction', () => {
      it('update loading state', () =>
        store.dispatch(loadingAction({loading: true}))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: LOADING_ACTION})).toBeDefined();
            state = reducer(state, {type: LOADING_ACTION, payload: _.last(actions).payload});
            expect(state.loading).toBe(true);
          })
      );
    });

    describe('uploadAction', () => {
      it('upload csv of drivers', () => {
        mock.onGet('/rest/drivers').reply(200);
        mock.onPost('/rest/drivers/data/upload').reply(200);
        return store.dispatch(uploadAction(store.dispatch, 'csv'))
          .then(() => {
            const actions = store.getActions();

            expect(_.find(actions, {type: LOADING_ACTION})).toBeDefined();
            expect(_.find(actions, {type: UPLOAD_ACTION})).toBeDefined();
            state = reducer(state, {type: UPLOAD_ACTION, payload: _.last(actions).payload});

            expect(state.loading).toBe(false);
            expect(state.status).toBe('success');
            expect(state.error).toBe(false);
          });
      });
      it('fail upload csv of drivers', () => {
        mock.onGet('/rest/drivers').reply(200);
        mock.onPost('/rest/drivers/data/upload').reply(500, 'Error message');
        return store.dispatch(uploadAction(store.dispatch, 'csv'))
          .then(() => {
            const actions = store.getActions();

            expect(_.find(actions, {type: LOADING_ACTION})).toBeDefined();
            expect(_.find(actions, {type: UPLOAD_ACTION})).toBeDefined();
            state = reducer(state, {type: UPLOAD_ACTION, payload: _.last(actions).payload});

            expect(state.loading).toBe(false);
            expect(state.status).toBe('error');
            expect(state.error).toBe('Error message');
          });
      });
    });
    describe('getSampleAction', () => {
      it('get csv sample', () => {
        mock.onGet('/rest/drivers/data/sample').reply(200);
        return store.dispatch(getSampleAction(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: GET_SAMPLE_ACTION})).toBeDefined();
            state = reducer(state, {type: GET_SAMPLE_ACTION, payload: _.last(actions).payload});
            expect(state.loading).toBe(false);
          });
      });
      it('fail to get csv sample', () => {
        mock.onGet('/rest/drivers/data/sample').reply(500, 'error message');
        return store.dispatch(getSampleAction(store.dispatch))
          .then(() => {
            const actions = store.getActions();
            expect(_.find(actions, {type: errorActions.HANDLE_ERROR})).toBeDefined();
            expect(_.find(actions, {type: GET_SAMPLE_ACTION})).toBeDefined();
            state = reducer(state, {type: GET_SAMPLE_ACTION, payload: _.last(actions).payload});
            expect(state).toEqual({ loading: false, error: 'error message', status: 'error' });
          });
      });
    });
  });
});

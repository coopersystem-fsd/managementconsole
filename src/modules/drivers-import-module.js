import { createAction, createReducer } from 'redux-action';
import {saveAs} from 'browser-filesaver';
import { showNotification } from './notifications-module';
import { driversAPI } from '../services/rest';
import { handleError } from './handle-error-module';

export const LOADING_ACTION = 'RA/DriversImport/LOADING_ACTION';
export const UPLOAD_ACTION = 'RA/DriversImport/UPLOAD_ACTION';
export const GET_SAMPLE_ACTION = 'RA/DriversImport/GET_SAMPLE_ACTION';

export const loadingAction = createAction(LOADING_ACTION, data => data);

export const uploadAction = createAction(UPLOAD_ACTION, (dispatch, csv) => {
  dispatch(loadingAction({loading: true, status: 'uploading'}));
  return driversAPI.upload(csv)
    .then(() => {
      dispatch(showNotification('File has been successfully processed'));
      return {
        loading: false,
        error: false,
        status: 'success',
      };
    })
    .catch(err =>
      ({
        error: err.data || err.message,
        loading: false,
        status: 'error',
      })
    );
});

export const getSampleAction = createAction(GET_SAMPLE_ACTION, dispatch =>
  driversAPI.getDriversDataSample()
    .then(({data}) => {
      const file = new Blob([data], {type: 'text/csv;charset=UTF-8'});
      saveAs(file, 'sample.csv');
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: err.data || err.message,
        loading: false,
        status: 'error',
      };
    })
);


export const actions = {
  loading: loadingAction,
};

export const complexActions = {
  upload: uploadAction,
  getSample: getSampleAction,
};

const initialState = {
  loading: false,
};

export default createReducer(initialState, {
  [LOADING_ACTION]: state => state,
  [UPLOAD_ACTION]: state => state,
  [GET_SAMPLE_ACTION]: state => state,
});

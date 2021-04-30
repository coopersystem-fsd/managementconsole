import { createAction, createReducer } from 'redux-action';
import { showNotification } from './notifications-module';
import { configs } from '../services/rest';
import { handleError } from './handle-error-module';

export const LOADING_ACTION = 'RA/User/LOADING_ACTION';
export const GET_UPGRADES_ACTION = 'RA/Upgrades/GET_UPGRADES_ACTION';
export const DELETE_UPGRADE_ACTION = 'RA/Upgrades/DELETE_UPGRADE_ACTION';
export const CREATE_UPGRADE_ACTION = 'RA/Upgrades/CREATE_UPGRADE_ACTION';
export const UPDATE_UPGRADE_ACTION = 'RA/Upgrades/UPDATE_UPGRADE_ACTION';

const loadingAction = createAction(LOADING_ACTION, data => data);

const getUpgradesAction = createAction(GET_UPGRADES_ACTION, (dispatch, params) =>
  configs.listAppInfo(params)
    .then(({data: serverResponse}) => ({
      serverResponse,
      loading: false,
      error: false,
    }))
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    })
);

const deleteUpgradesAction = createAction(DELETE_UPGRADE_ACTION, (dispatch, appVersion) =>
  configs.deleteAppInfo(appVersion.id)
    .then(() => {
      dispatch(showNotification(`${appVersion.avatarType} ${appVersion.version} for ${appVersion.platformType} was successfully deleted.`));
      return {
        error: false,
        loading: false,
      };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    })
);

const createUpgradesAction = createAction(CREATE_UPGRADE_ACTION, (dispatch, params) =>
  configs.createAppInfo(params)
    .then(() => {
      dispatch(showNotification(`${params.avatarType} ${params.version} for ${params.platformType} was successfully created.`));
      return {
        error: false,
        loading: false,
      };
    })
    .catch(err =>
      ({
        error: err.data,
        loading: false,
      })
    )
);

const updateUpgradesAction = createAction(UPDATE_UPGRADE_ACTION, (dispatch, params) =>
  configs.updateAppInfo(params)
  .then(() => {
    dispatch(showNotification(`${params.avatarType} ${params.version} for ${params.platformType} was successfully updated.`));
    return {
      error: false,
      loading: false,
    };
  })
  .catch(err =>
    ({
      error: err.data,
      loading: false,
    })
  )
);

export const actions = {
  loading: loadingAction,
};

export const complexActions = {
  getUpgrades: getUpgradesAction,
  deleteUpgrades: deleteUpgradesAction,
  createUpgrades: createUpgradesAction,
  updateUpgrades: updateUpgradesAction,
};

const initialState = {
  loading: true,
};

export default createReducer(initialState, {
  [LOADING_ACTION]: state => state,
  [GET_UPGRADES_ACTION]: state => state,
});

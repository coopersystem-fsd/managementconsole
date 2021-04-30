import { createAction, createReducer } from 'redux-action';
import { handleError } from './handle-error-module';
import { getUsersByType } from '../services/user';
import { driversAPI} from '../services/rest';
import { showNotification} from './notifications-module';


export const GET_USERS_ACTION = 'GET_USERS_ACTION';
export const DRIVERS_TOOGLE_WOMEN_ONLY_ACTION = 'DRIVERS_TOOGLE_WOMEN_ONLY_ACTION';
export const DRIVER_STATUS_CHANGE_ACTION = 'DRIVER_STATUS_CHANGE_ACTION';
export const REFRESH_PAYONEER_STATUS_ACTION = 'REFRESH_PAYONEER_STATUSES_ACTION';

const getDriversAction = createAction(GET_USERS_ACTION, (dispatch, params, filters) =>
  new Promise((resolve) => {
    getUsersByType(params)
    .then((response) => {
      const womenOnly = {};

      const drivers =
        _.chain(response)
        .map(({content}) => content)
        .flatten()
        .value();

      drivers.forEach(({driverId, driverTypes} = {}) => {
        if (driverId) {
          womenOnly[driverId] = { womenOnly: _.indexOf(driverTypes, 'WOMEN_ONLY') > -1 };
        }
      });

      const data = {
        data: response.data.content,
        womenOnly,
        serverResponse: response.data,
        params,
        filters,
      };
      resolve(data);
    })
    .catch(err => dispatch(handleError(err)));
  })
);

const driverStatusChangeAction =
  createAction(DRIVER_STATUS_CHANGE_ACTION, (driverID, params, newState, status) =>
    ({driverID, params, newState, status})
  );

const driversToogleWomenOnlyAction =
  createAction(DRIVERS_TOOGLE_WOMEN_ONLY_ACTION, (dispatch, driverID, params, newState) =>
    new Promise(() => {
      dispatch(driverStatusChangeAction(driverID, params, newState, 'saving'));
      driversAPI.toggleWomenOnlyPromise(driverID, params).then(() => {
        dispatch(driverStatusChangeAction(driverID, params, newState, null));
      }).catch(() => {
        dispatch(driverStatusChangeAction(driverID, params, newState, 'error'));
      });
    })
  );

const updatePayoneerStatusAction =
  createAction(REFRESH_PAYONEER_STATUS_ACTION, dispatch =>
    new Promise((resolve) => {
      driversAPI.updatePayoneerStatus().then((response) => {
        dispatch(showNotification('Payoneer status succesfully updated'));
        resolve(response);
      }).catch((err) => {
        err.data = 'Error updating payoneer statuses';
        dispatch(handleError(err));
        resolve(err);
      });
    })
  );

export const actions = {
  driverStatusChange: driverStatusChangeAction,
};

// Actions that need dispatch reference
export const complexActions = {
  getDrivers: getDriversAction,
  driversToogleWomenOnly: driversToogleWomenOnlyAction,
  updatePayoneerStatus: updatePayoneerStatusAction,
};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};

const initialState = {
// Initial State goes here!
};

const usersReducer = createReducer(initialState, {
  [GET_USERS_ACTION]: (actionPayload, state) => ({ ...state, usersListData: actionPayload }),
  [DRIVER_STATUS_CHANGE_ACTION]: (actionPayload, state) => {
    const usersListData = state.usersListData;
    const womenOnly = Object.assign({}, usersListData.womenOnly);
    womenOnly[actionPayload.driverID].status = actionPayload.status;
    womenOnly[actionPayload.driverID].womenOnly = actionPayload.newState;
    return {...usersListData, ...{womenOnly}};
  },
});

export default usersReducer;

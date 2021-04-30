import { createAction, createReducer } from 'redux-action';
import axios from 'axios';
import { showNotification } from './notifications-module';
import {driversAPI, driverCarsAPI, driversDocumentsAPI} from '../services/rest';
import constants from '../data/constants';
import { handleError } from './handle-error-module';
import jsgradient from '../helpers/gradient';

export const LIST_USERS_ACTION = 'RA/DriverFunnel/LIST_USERS_ACTION';
export const UPDATE_CAR_STATUS_ACTION = 'RA/DriverFunnel/UPDATE_CAR_STATUS_ACTION';
export const UPDATE_CAR_DOCUMENT_STATUS_ACTION = 'RA/DriverFunnel/UPDATE_CAR_DOCUMENT_STATUS_ACTION';
export const LOADING_ACTION = 'RA/DriverFunnel/LOADING_ACTION';
export const UPDATE_DRIVER_DOCUMENT_ACTION = 'RA/DriverFunnel/UPDATE_DRIVER_DOCUMENT_ACTION';
export const UPDATE_DRIVER_ACTION = 'RA/DriverFunnel/UPDATE_DRIVER_ACTION';
export const REFRESH_STATUSES_ACTION = 'RA/DriverFunnel/REFRESH_STATUSES_ACTION';
export const EXPORT_DRIVERS_ACTION = 'RA/DriverFunnel/EXPORT_DRIVERS_ACTION';
export const UPDATE_ACTION = 'RA/DriverFunnel/UPDATE_ACTION';

const mapPendingFiltersToStatuses = pendingFilters =>
  _.map(pendingFilters, (v, k) => {
    const pendingFiltersToStatuses = constants.driverFunnel.mapPendingFiltersToStatuses.slice();
    const status = _.find(pendingFiltersToStatuses, {id: k});
    if (status) {
      const newStatus = Object.assign({}, status);
      newStatus.drivers = v;
      newStatus.users = v;
      newStatus.id = status.status;
      return newStatus;
    }
    return false;
  }).filter(Boolean);

const getFunnel = (pendingFilters) => {
  const colorPallette = jsgradient('#E50031', '#fca701', 10);
  pendingFilters = mapPendingFiltersToStatuses(pendingFilters);

  return _.chain(pendingFilters)
      .sortBy('drivers')
      .reverse()
      .map((status, index) => {
        status.color = colorPallette[index];
        status.name = _.find(constants.driverFunnel.filters, {id: status.id}).name;
        return status;
      })
      .value();
};

const loadingAction = createAction(LOADING_ACTION, (loading = false) => ({loading}));

const updateAction = createAction(UPDATE_ACTION, data => data);

const refreshStatusesAction = createAction(REFRESH_STATUSES_ACTION, (dispatch, cityId) =>
  driversAPI.listDriverStatusesPending({cityId})
    .then(({data: pendingFilters}) => {
      const funnel = getFunnel(pendingFilters);
      return {funnel, pendingFilters};
    })
    .catch((err) => {
      dispatch(handleError(err));
    })
);

export const exportDriversAction = createAction(EXPORT_DRIVERS_ACTION, (dispatch, params) =>
  driversAPI.exportDrivers(params)
    .then(() => ({error: false}))
    .catch((err) => {
      dispatch(handleError(err));
      return {error: true};
    })
);

const listUsersAction = createAction(LIST_USERS_ACTION, (dispatch, params = {}) => {
  if (!params.silent) dispatch(loadingAction(true));
  delete params.silent;
  dispatch(refreshStatusesAction(dispatch, params.cityId));
  return driversAPI.listDriversDto(params)
    .then(({data: serverResponse}) => {
      const users = serverResponse.content.slice();
      return {
        loading: false,
        error: false,
        params,
        serverResponse,
        users,
      };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
        params,
      };
    });
});

export const updateCarStatusAction =
createAction(UPDATE_CAR_STATUS_ACTION,
  (dispatch, {user, car, statusValue, statusName, carPhotosStatus}) => {
    const params = Object.assign({}, {driverId: user.driverId, carId: car.id}, car);
    params.carCategories = params.categories;

    delete params.categories;
    delete params.insurancePhotoUrl;
    delete params.insuranceStatus;
    delete params.carPhotosStatus;
    delete params.inspectionStickerStatus;

    return driverCarsAPI.editCar(params)
    .then(() => {
      dispatch(showNotification(`${user.firstName} ${user.lastName}'s car (${car.make} ${car.model}) was updated to ${statusName}${carPhotosStatus ? `(${carPhotosStatus})` : ''}: ${statusValue}.`));
      return {
        error: false,
      };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    });
  });

export const updateCarDocumentStatusAction =
  createAction(UPDATE_CAR_DOCUMENT_STATUS_ACTION,
    (dispatch, {user, car, statusValue, statusName, cityId, type, filter}) =>
      driversDocumentsAPI.listCarDocuments(user.driverId, car.id)
      .then(({data: documents}) => {
        const promises =
          _.chain(documents)
            .filter(d => d.documentType === type)
            .map((d) => {
              const newDocument = Object.assign({}, {
                documentStatus: statusValue,
                documentId: d.id,
                cityId,
              });
              return driversDocumentsAPI.updateDocument(newDocument);
            })
            .value();
        return axios.all(promises);
      })
      .then((res) => {
        const string = filter.id === 'carPhotosStatus' ? `${type ? `(${type})` : ''}` : '';
        if (res.length > 0) {
          dispatch(showNotification(`${user.firstName} ${user.lastName}'s car (${car.make} ${car.model}) was updated to ${statusName}${string}: ${statusValue}.`));
          return { error: false };
        }
        dispatch(showNotification(`${user.firstName} ${user.lastName}'s car (${car.make} ${car.model}) ${statusName}${string} could not be found.`, 'danger'));
        return { error: true };
      })
      .catch((err) => {
        dispatch(handleError(err));
        return {
          error: true,
        };
      })
    );

export const updateDriverDocumentAction =
createAction(UPDATE_DRIVER_DOCUMENT_ACTION, (dispatch, {user, type, newStatus, status}) =>
  driversDocumentsAPI.listDriverDocuments(user.driverId)
    .then(({data: documents}) => {
      const promises =
        _.chain(documents)
          .filter(({removed, documentType}) => (!removed && documentType === type))
          .map((d) => {
            d.documentId = d.id;
            d.documentStatus = newStatus;
            return driversDocumentsAPI.updateDocument(d);
          })
          .value();
      return axios.all(promises);
    })
    .then((res) => {
      if (res.length > 0) {
        dispatch(showNotification(`${user.firstName} ${user.lastName}'s ${status.name} was updated to ${status.value}.`));
        return { error: false };
      }
      dispatch(showNotification(`${user.firstName} ${user.lastName}'s ${status.name} could not be found.`, 'danger'));
      return { error: true };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    })
);

export const updateDriverAction =
createAction(UPDATE_DRIVER_ACTION, (dispatch, {user, status, statusName, statusValue}) =>
  driversAPI.getDriver({id: user.driverId})
    .then(({data}) => {
      const newUser = Object.assign({}, data, status);
      if (statusName === 'Activation Status') {
        newUser.active = status.activationStatus === 'ACTIVE';
      }
      return driversAPI.updateDriver(newUser);
    })
    .then(() => {
      dispatch(showNotification(`${user.firstName} ${user.lastName}'s ${statusName} was updated to ${statusValue}.`));
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    })
);

export const actions = {
  loading: loadingAction,
  update: updateAction,
};

export const complexActions = {
  listUsers: listUsersAction,
  updateCarStatus: updateCarStatusAction,
  updateDriverDocument: updateDriverDocumentAction,
  updateDriver: updateDriverAction,
  exportDrivers: exportDriversAction,
  updateCarDocumentStatus: updateCarDocumentStatusAction,
};

const initialState = {
  loading: true,
  funnel: [],
};

const driverFunnelReducer = createReducer(initialState, {
  [LIST_USERS_ACTION]: state => state,
  [LOADING_ACTION]: state => state,
  [REFRESH_STATUSES_ACTION]: state => state,
  [UPDATE_ACTION]: state => state,
});

export default driverFunnelReducer;

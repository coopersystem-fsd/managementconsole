import { createAction, createReducer } from 'redux-action';
import { showNotification } from './notifications-module';
import { ridersAPI, driversAPI, driversDocumentsAPI, driverCarsAPI } from '../services/rest';
import { handleError } from './handle-error-module';

export const LOADING_ACTION = 'RA/Profile/LOADING_ACTION';
export const CLEANUP_ACTION = 'RA/Profile/CLEANUP_ACTION';
export const SEND_ACTIVATION_EMAIL_ACTION = 'RA/Profile/SEND_ACTIVATION_EMAIL_ACTION';
export const GET_USER_ACTION = 'RA/Profile/GET_USER_ACTION';
export const GET_CAR_DOCUMENTS_ACTION = 'RA/Profile/GET_CAR_DOCUMENTS_ACTION';
export const UPDATE_CAR_ACTION = 'RA/Profile/UPDATE_CAR_ACTION';
export const SELECT_CAR_ACTION = 'RA/Profile/SELECT_CAR_ACTION';
export const UNLOCK_RIDER_ACTION = 'RA/Profile/UNLOCK_RIDER_ACTION';
export const RESET_EMAIL_ACTION = 'RA/Profile/RESET_EMAIL_ACTION';
export const RELEASE_DRIVER_ACTION = 'RA/Profile/RELEASE_DRIVER_ACTION';

const loadingAction = createAction(LOADING_ACTION, data => data);

const cleanupAction = createAction(CLEANUP_ACTION, data => data);

const sendActivationEmailAction = createAction(SEND_ACTIVATION_EMAIL_ACTION, (dispatch, id) =>
  driversAPI.sendActivationEmail(id)
    .then(() => {
      dispatch(showNotification('Activation Email Has Been Sent.'));
    })
    .catch(({data}) => {
      dispatch(showNotification(data, 'danger'));
      return {
        error: true,
        loading: false,
      };
    })
  );

const releaseDriverAction = createAction(RELEASE_DRIVER_ACTION, (dispatch, id, status) => {
  if (status === 'STUCK') {
    driversAPI.release(id)
      .then(() => {
        dispatch(showNotification('Driver has been released'));
      });
  }
});

const getCarDocumentsAction = createAction(GET_CAR_DOCUMENTS_ACTION, ({driverId, carId}) =>
  driversDocumentsAPI.listCarDocuments(driverId, carId)
    .then(({data}) => ({
      id: carId,
      data: _.filter(data, ({documentType}) => ['FRONT', 'BACK', 'TRUNK', 'INSIDE'].indexOf(documentType) > -1),
    }))
);

const updateCarAction = createAction(UPDATE_CAR_ACTION, (dispatch, params) => {
  driverCarsAPI.editCar(params)
  .catch((err) => {
    dispatch(handleError(err));
    return {
      error: true,
      loading: false,
    };
  });
  return params;
});

const selectCarAction = createAction(SELECT_CAR_ACTION, (dispatch, {user, car, carDocuments}) => {
  if (!carDocuments[car.id]) {
    dispatch(getCarDocumentsAction({driverId: user.id, carId: car.id}));
  }
  return { selectedCar: car };
});

const unlockRiderAction = createAction(UNLOCK_RIDER_ACTION, (dispatch, id) =>
  ridersAPI.unlockRider(id)
    .then(() => {
      dispatch(showNotification('Rider\'s cards have been unlocked'));
    })
    .catch(({data}) => {
      dispatch(showNotification(data, 'danger'));
      return {
        error: true,
        loading: false,
      };
    })
);

const resetEmailAction = createAction(RESET_EMAIL_ACTION, (dispatch, email) =>
  ridersAPI.resetEmail(email)
    .then(() => {
      dispatch(showNotification('Password has been reset and email has been sent'));
    })
    .catch(({data}) => {
      dispatch(showNotification(data, 'danger'));
      return {
        error: true,
        loading: false,
      };
    })
);

const getUserAction = createAction(GET_USER_ACTION, (dispatch, {userType, userId}) => {
  dispatch(loadingAction({loading: true}));
  const promise = userType === 'riders' ? ridersAPI.getRider(userId) : driversAPI.getDriver({id: userId});
  return promise
    .then(({data: user}) => {
      const selectedCar = _.find(user.cars, {selected: true});
      if (selectedCar) {
        dispatch(getCarDocumentsAction({driverId: user.id, carId: selectedCar.id}));
      }
      return {
        user,
        selectedCar,
        loading: false,
        error: false,
      };
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    });
});


export const actions = {
  loading: loadingAction,
  cleanup: cleanupAction,
};

export const complexActions = {
  getUser: getUserAction,
  selectCar: selectCarAction,
  updateCar: updateCarAction,
  sendActivationEmail: sendActivationEmailAction,
  release: releaseDriverAction,
  unlockRider: unlockRiderAction,
  resetEmail: resetEmailAction,
};

const initialState = {
  loading: true,
  user: {},
  selectedCar: {},
  carDocuments: {},
};

export default createReducer(initialState, {
  [LOADING_ACTION]: state => state,
  [GET_USER_ACTION]: state => state,
  [SELECT_CAR_ACTION]: state => state,
  [CLEANUP_ACTION]: () => ({loading: true, user: {}, selectedCar: {}, carDocuments: {}}),
  [UPDATE_CAR_ACTION]: (car, state) => {
    const cars = state.user.cars.slice();
    const carIndex = _.findIndex(cars, {id: car.id});
    cars[carIndex] = car;
    return {
      user: Object.assign({}, state.user, {cars}),
      selectedCar: car,
    };
  },
  [GET_CAR_DOCUMENTS_ACTION]: ({id, data}, state) =>
    ({ carDocuments: Object.assign({}, state.carDocuments, {[id]: data}) }),
  [UNLOCK_RIDER_ACTION]: state => state,
});

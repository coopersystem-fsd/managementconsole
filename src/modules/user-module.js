import { createAction, createReducer } from 'redux-action';
import axios from 'axios';
import { showNotification } from './notifications-module';
import {
  driversAPI,
  driversDocumentsAPI,
  driverCarsAPI,
  driversEmailRemindersAPI,
  ridersAPI,
  lostAndFoundAPI,
  campaignsAPI,

} from '../services/rest';
import { handleError } from './handle-error-module';
import constants from '../data/constants';

export const GET_RIDER_ACTION = 'RA/User/GET_RIDER_ACTION';
export const UPDATE_RIDER_ACTION = 'RA/User/UPDATE_RIDER_ACTION';
export const GET_DRIVER_ACTION = 'RA/User/GET_DRIVER_ACTION';
export const GET_DRIVER_DOCUMENTS_ACTION = 'RA/User/GET_DRIVER_DOCUMENTS_ACTION';
export const GET_CAR_DOCUMENTS_ACTION = 'RA/User/GET_CAR_DOCUMENTS_ACTION';
export const UPDATE_DRIVER_DOCUMENT_ACTION = 'RA/User/UPDATE_DRIVER_DOCUMENT_ACTION';
export const CREATE_DRIVER_DOCUMENT_ACTION = 'RA/User/CREATE_DRIVER_DOCUMENT_ACTION';
export const GET_DRIVER_ONBOARDING_ACTION = 'RA/User/GET_DRIVER_ONBOARDING_ACTION';
export const CLEAR_DRIVER_ONBOARDING_ACTION = 'RA/User/CLEAR_DRIVER_ONBOARDING_ACTION';
export const UPDATE_DRIVER_ACTION = 'RA/User/UPDATE_DRIVER_ACTION';
export const LOADING_ACTION = 'RA/User/LOADING_ACTION';
export const CREATE_CAR_ACTION = 'RA/User/CREATE_CAR_ACTION';
export const UPDATE_CAR_ACTION = 'RA/User/UPDATE_CAR_ACTION';
export const DELETE_CAR_ACTION = 'RA/User/DELETE_CAR_ACTION';
export const UPDATE_CHECKR_ACTION = 'RA/User/UPDATE_CHECKR_ACTION';
export const CREATE_CHECKR_ACTION = 'RA/User/CREATE_CHECKR_ACTION';
export const GET_DRIVERS_EMAIL_HISTORY_ACTION = 'RA/User/GET_DRIVERS_EMAIL_HISTORY_ACTION';
export const SEND_DRIVERS_EMAIL_ACTION = 'RA/User/SEND_DRIVERS_EMAIL_ACTION';
export const GET_EMAIL_TEMPLATE_ACTION = 'RA/User/GET_EMAIL_TEMPLATE_ACTION';
export const GET_SENT_EMAIL_TEMPLATE_ACTION = 'RA/User/GET_SENT_EMAIL_TEMPLATE_ACTION';
export const SET_ACTIVE_TAB_ACTION = 'RA/User/SET_ACTIVE_TAB_ACTION';
export const GET_LOST_ITEMS_ACTION = 'RA/User/GET_LOST_ITEMS_ACTION';
export const GET_CAMPAIGNS_ACTION = 'RA/User/GET_CAMPAIGNS_ACTION';
export const CAMPAIGN_SUBSCRIBE_ACTION = 'RA/Campaigns/CAMPAIGN_SUBSCRIBE_ACTION';
export const CAMPAIGN_UNSUBSCRIBE_ACTION = 'RA/Campaigns/CAMPAIGN_UNSUBSCRIBE_ACTION';
export const UPDATE_DOCUMENT_STATUS_ACTION = 'RA/User/UPDATE_DOCUMENT_STATUS_ACTION';

const getOnboarding = (onboardingResponse) => {
  const statuses = constants.driverFunnel.filters.slice();
  return _.chain(onboardingResponse)
      .first()
      .map((v, k) => {
        if (k === 'cars') {
          return _.map(v, (c) => {
            const car = Object.assign({}, c);
            const carStatuses = _.map(car, (carValue, carKey) => {
              if (carKey === 'inspectionStatus') {
                carKey = 'carInspectionStatus';
              }

              const s = _.find(statuses.slice(), {id: carKey});
              const status = s ? Object.assign({}, s) : null;

              if (status && carKey === 'carPhotosStatus') {
                status.value = _.map(carValue, (photoValue, photoKey) => {
                  const photo = _.find(status.options, {id: photoValue});
                  if (photo) {
                    const newPhoto = Object.assign({}, photo);
                    newPhoto.type = photoKey;
                    return newPhoto;
                  }
                  return false;
                }).filter(Boolean);
                return status;
              } else if (status) {
                status.value = _.find(status.options.slice(), {id: carValue});
                return status;
              }

              return false;
            }).filter(Boolean);
            return {
              id: 'car',
              car,
              statuses: carStatuses,
            };
          });
        }

        const status = _.find(statuses, {id: k});
        if (status && k === 'payoneerStatus') {
          status.value = _.find(status.options, {name: v});
          return status;
        } else if (status) {
          status.value = _.find(status.options, {id: v});
          return status;
        }
        return false;
      })
      .compact()
      .value();
};

const loadingAction = createAction(LOADING_ACTION, data => data);

const setActiveTabAction = createAction(SET_ACTIVE_TAB_ACTION, activeTab => ({activeTab}));

const getEmailHistoryAction = createAction(GET_DRIVERS_EMAIL_HISTORY_ACTION, driverId =>
  driversEmailRemindersAPI.history(driverId)
    .then(({data: emailHistory}) => ({emailHistory}))
);

const getCampaignsAction = createAction(GET_CAMPAIGNS_ACTION, (dispatch, id) =>
  campaignsAPI.getCampaignInfo(id)
    .then((res) => {
      return res.data;
    })
);

const subscribeAction = createAction(CAMPAIGN_SUBSCRIBE_ACTION, (dispatch, campaignId, riderId) => {
  campaignsAPI.subscribeRider(campaignId, riderId)
    .then((res) => {
      if (res.error) {
        dispatch(showNotification('Error when subscribing'));
      } else {
        dispatch(showNotification('Rider has been subscribed to campaign'));
      }
    });
});

const unsubscribeAction = createAction(CAMPAIGN_UNSUBSCRIBE_ACTION,
  (dispatch, campaignId, riderId) => {
    campaignsAPI.unsubscribeRider(campaignId, riderId)
      .then((res) => {
        if (res.error) {
          dispatch(showNotification('Error when unsubscribing'));
        } else {
          dispatch(showNotification('Rider has been unsubscribed from campaign'));
        }
      });
  });

const getRiderAction = createAction(GET_RIDER_ACTION, (dispatch, {userID: id}) =>
  ridersAPI.getRider(id)
    .then((res) => {
      const getAvatarId = (user) => {
        const type = user.type;
        const avatars = user.user.avatars;
        let avatarId = null;
        _.forEach(avatars, (avatar) => {
          if (avatar.type === type) avatarId = avatar.id;
        });
        return avatarId;
      };
      const data = res.data;
      const avatarId = getAvatarId(data);
      return lostAndFoundAPI.getLostAndFound(avatarId).then((response) => {
        const lostItems = response.data;
        return {
          data,
          lostItems,
          loading: false,
          error: false,
        };
      });
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    })
);

const updateRiderAction = createAction(UPDATE_RIDER_ACTION, (dispatch, rider) =>
  ridersAPI.updateRider(rider)
    .then(({data}) =>
      ({
        data,
        error: false,
      })
    )
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    })
);

const getEmailTemplateAction = createAction(GET_EMAIL_TEMPLATE_ACTION, (dispatch, params) =>
  driversEmailRemindersAPI.reminderContent(params)
    .then(({data}) => data)
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    })
);

const getSentEmailTemplateAction = createAction(GET_SENT_EMAIL_TEMPLATE_ACTION, (dispatch, id) =>
  driversEmailRemindersAPI.reminderHistory(id)
    .then(({data}) => data)
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    })
);

const sendEmailAction = createAction(SEND_DRIVERS_EMAIL_ACTION, (dispatch, params) =>
  driversEmailRemindersAPI.sendReminder(params)
    .then(() => {
      dispatch(showNotification('Email has been successfully sent.'));
      dispatch(getEmailHistoryAction(params.driverId));
    })
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
      };
    })
);

const getDriverOnboardingAction =
createAction(GET_DRIVER_ONBOARDING_ACTION, (dispatch, {id, cityId}) =>
  driversAPI.listDriversDto({driverId: id, cityId})
    .then(({data: {content: onboardingData}}) => {
      const onboarding = getOnboarding(onboardingData);
      return {
        onboarding,
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
    })
);

const clearDriverOnboardingAction = createAction(CLEAR_DRIVER_ONBOARDING_ACTION, () =>
  ({
    onboarding: null,
  })
);

const getDriverAction = createAction(GET_DRIVER_ACTION, (dispatch, {userID: id}) => {
  dispatch(loadingAction({loading: true}));
  let data = {};
  const getAvatarId = (user) => {
    const type = user.type;
    const avatars = user.user.avatars;
    let avatarId = null;
    _.forEach(avatars, (avatar) => {
      if (avatar.type === type) avatarId = avatar.id;
    });
    return avatarId;
  };
  return driversAPI.getDriver({id})
    .then((res) => {
      data = res.data;
      const avatarId = getAvatarId(data);
      const promises = [
        driversDocumentsAPI.listDriverDocuments(id),
        driversAPI.listDriversDto({driverId: id, cityId: data.cityId}),
        lostAndFoundAPI.getLostAndFound(avatarId),
      ];
      return axios.all(promises);
    })
    .then(axios.spread(({data: documents}, {data: {content: driver}}, {data: lostItems}) => {
      driver = _.first(driver);
      data.cars = _.map(data.cars, (car) => {
        const carFromList = _.find(driver.cars, {id: car.id});
        if (carFromList) car.insurancePictureUrl = carFromList.insurancePhotoUrl;
        return car;
      });
      data.licensePictureUrl = driver.driverLicensePicture;
      dispatch(getDriverOnboardingAction(dispatch, {id, cityId: data.cityId}));
      dispatch(getEmailHistoryAction(id));
      documents = _.filter(documents, ({removed}) => !removed);
      return {
        data,
        documents,
        lostItems,
        loading: false,
        error: false,
      };
    }))
    .catch((err) => {
      dispatch(handleError(err));
      return {
        error: true,
        loading: false,
      };
    });
});

const getDriverDocumentsAction =
  createAction(GET_DRIVER_DOCUMENTS_ACTION, (dispatch, id) =>
    driversDocumentsAPI.listDriverDocuments(id)
      .then(({data: documents}) =>
        ({
          documents,
          error: false,
        })
      )
      .catch((err) => {
        dispatch(handleError(err));
        return {
          error: true,
        };
      })
  );

const getCarDocumentsAction =
  createAction(GET_CAR_DOCUMENTS_ACTION, (dispatch, {id, carId, carDocuments}) =>
    driversDocumentsAPI.listCarDocuments(id, carId)
      .then(({data: documents}) => {
        const newDocuments = carDocuments.slice();
        const carDocumentIndex = _.findIndex(newDocuments, {carId});
        const carDocument = {
          carId,
          carDocuments: documents,
        };
        carDocument.carId = _.toNumber(carDocument.carId);
        if (carDocumentIndex > -1) {
          newDocuments[carDocumentIndex] = carDocument;
        } else {
          newDocuments.push(carDocument);
        }
        return {
          carDocuments: newDocuments,
          error: false,
        };
      })
      .catch((err) => {
        dispatch(handleError(err));
        return {
          error: true,
        };
      })
  );

const updateDriverDocumentAction =
  createAction(UPDATE_DRIVER_DOCUMENT_ACTION, (
    dispatch, {
      documents,
      carDocuments,
      newDocument: {
        driverId,
        driverPhotoType,
        cityId,
        carId,
        fileData,
        validityDate,
        documentId,
        documentStatus,
      },
  }) => {
    const promises = carId ?
      _.chain(carDocuments)
         .filter(car => car.carId === carId)
         .map(({carDocuments: d}) => d)
         .first()
         .filter(({documentType}) => documentType === driverPhotoType)
         .map((doc) => {
           if (fileData) {
             return driversDocumentsAPI.deleteDocument(doc.id);
           }
           return new Promise(resolve => resolve(doc));
         })
       .value()
       :
      _.chain(documents)
         .filter(({documentType}) => documentType === driverPhotoType)
         .map((doc) => {
           if (fileData) {
             return driversDocumentsAPI.deleteDocument(doc.id);
           }
           return new Promise(resolve => resolve(doc));
         })
       .value();

    return axios.all(promises)
      .then((carDocs) => {
        if (fileData) {
          return driversDocumentsAPI.addDocument({
            driverId,
            driverPhotoType,
            fileData,
            carId,
            cityId,
            validityDate,
          });
        }
        if (carId) {
          const carDoc = _.last(carDocs);
          const newCarDoc = Object.assign({}, carDoc, { documentId: carDoc.id, validityDate });
          return driversDocumentsAPI.updateDocument(newCarDoc);
        }
        return driversDocumentsAPI.updateDocument({
          driverPhotoType,
          validityDate,
          documentId,
          cityId,
          documentStatus,
        });
      })
      .then(() => {
        if (carId) {
          return dispatch(getCarDocumentsAction(dispatch, {id: driverId, carId, carDocuments}));
        }
        return driversDocumentsAPI.listDriverDocuments(driverId);
      })
      .then((res) => {
        if (res.type === GET_CAR_DOCUMENTS_ACTION) {
          if (!res.payload.error) {
            return {
              carDocuments: res.payload.carDocuments,
              error: false,
            };
          }
          return {
            error: true,
          };
        }
        return {
          documents: res.data,
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

const createDriverDocumentAction =
  createAction(CREATE_DRIVER_DOCUMENT_ACTION, (
    dispatch, documents, {driverId, driverPhotoType, cityId, carId, fileData}) => {
    const promises =
      _.chain(documents)
       .filter(({documentType}) => documentType === driverPhotoType)
       .map(doc => driversDocumentsAPI.deleteDocument(doc.id))
       .value();

    return axios.all(promises)
      .then(() =>
        driversDocumentsAPI.addDocument({driverId, driverPhotoType, fileData, carId, cityId}))
      .then(() => driversDocumentsAPI.listDriverDocuments(driverId))
      .then(({data}) =>
        ({
          documents: data,
          error: false,
        })
      )
      .catch((err) => {
        dispatch(handleError(err));
        return {
          error: true,
        };
      });
  });

const updateDriverAction = createAction(UPDATE_DRIVER_ACTION, (dispatch, driver) =>
  driversAPI.updateDriver(driver)
  .then(() => dispatch(getDriverAction(dispatch, {userID: driver.id})))
  .then(({payload}) => payload)
  .catch((err) => {
    dispatch(handleError(err));
    return {
      error: true,
    };
  })
);

const createCarAction = createAction(CREATE_CAR_ACTION, (dispatch, body, user) =>
  driverCarsAPI.addCar(body)
  .then(({data: car}) => {
    dispatch(showNotification('Car has been successfully added'));
    const data = Object.assign({}, user);
    data.cars.push(car);
    return {
      data,
      error: false,
    };
  })
  .catch((err) => {
    dispatch(handleError(err));
    return {
      error: true,
    };
  })
);

const updateCarAction = createAction(UPDATE_CAR_ACTION, (dispatch, body, user) =>
  driverCarsAPI.editCar(body)
  .then(({data: car}) => {
    const data = Object.assign({}, user);
    const carIndex = _.findIndex(data.cars, {id: body.id});
    data.cars[carIndex] = Object.assign({}, car, {insurancePictureUrl: body.insurancePictureUrl});
    return {
      data,
      error: false,
    };
  })
  .catch((err) => {
    dispatch(handleError(err));
    return {
      error: true,
    };
  })
);

const deleteCarAction = createAction(DELETE_CAR_ACTION, (dispatch, body, user) =>
  driverCarsAPI.removeCar(body)
  .then(() => {
    dispatch(showNotification(`${body.make} ${body.model} has been successfully removed`));
    const data = Object.assign({}, user);
    data.cars =
      _.chain(data.cars)
      .map((car) => {
        if (car.id === body.id) car.removed = true;
        return car;
      })
      .value();
    return {
      data,
      error: false,
    };
  })
  .catch((err) => {
    dispatch(handleError(err));
    return {
      error: true,
    };
  })
);

const updateCheckrAction =
  createAction(UPDATE_CHECKR_ACTION, (dispatch, id, user) =>
    driversAPI.updateCheckrReport(id)
      .then(({data}) => {
        dispatch(showNotification('Checkr report has been requested'));
        const newUser = Object.assign({}, user);
        const checkrReportIndex = _.findIndex(newUser.checkrReports, {id: data.id});
        if (checkrReportIndex > -1) {
          newUser.checkrReports[checkrReportIndex] = data;
        }
        return {
          data: newUser,
          error: false,
        };
      }
      )
      .catch((err) => {
        dispatch(handleError(err));
        return {
          error: true,
        };
      })
  );

const createCheckrAction =
  createAction(CREATE_CHECKR_ACTION, (dispatch, params, user) =>
    driversAPI.createCheckrReport(params)
      .then(({data}) => {
        dispatch(showNotification('Checkr report has been requested'));
        user.checkrReports.unshift(data);
        return {
          data: user,
          error: false,
        };
      }
      )
      .catch((err) => {
        dispatch(handleError(err));
        return { error: err.data || err.message };
      })
  );

const getLostItemsAction = createAction(GET_LOST_ITEMS_ACTION, (dispatch, avatarId, user) => {
  lostAndFoundAPI.getLostAndFound(avatarId)
      .then(({data}) => {
        user.lostAndFoundItems = data;
        return {
          data: user,
          error: false,
        };
      })
      .catch(err => handleError(err));
}
);

const updateDocumentStatusAction = createAction(
  UPDATE_DOCUMENT_STATUS_ACTION, (dispatch, v) => {
    const newDocument = Object.assign({}, {
      documentStatus: v.status,
      documentId: v.id,
    });
    driversDocumentsAPI.updateDocument(newDocument);
  }
);

export const actions = {
  loading: loadingAction,
  getEmailHistory: getEmailHistoryAction,
  clearDriverOnboarding: clearDriverOnboardingAction,
  setActiveTab: setActiveTabAction,
};

export const complexActions = {
  getRider: getRiderAction,
  getCampaigns: getCampaignsAction,
  subscribe: subscribeAction,
  unsubscribe: unsubscribeAction,
  updateRider: updateRiderAction,
  getDriver: getDriverAction,
  updateDriver: updateDriverAction,
  getDriverOnboarding: getDriverOnboardingAction,
  getDriverDocuments: getDriverDocumentsAction,
  getCarDocuments: getCarDocumentsAction,
  updateDriverDocument: updateDriverDocumentAction,
  createDriverDocument: createDriverDocumentAction,
  createCar: createCarAction,
  updateCar: updateCarAction,
  deleteCar: deleteCarAction,
  updateCheckr: updateCheckrAction,
  createCheckr: createCheckrAction,
  sendEmail: sendEmailAction,
  getEmailTemplate: getEmailTemplateAction,
  getSentEmailTemplate: getSentEmailTemplateAction,
  getLostItems: getLostItemsAction,
  updateDocumentStatus: updateDocumentStatusAction,
};


const initialState = {
  loading: true,
  carDocuments: [],
  profileUpdating: false,
};

export default createReducer(initialState, {
  [LOADING_ACTION]: user => user,
  [SET_ACTIVE_TAB_ACTION]: user => user,
  [GET_RIDER_ACTION]: user => user,
  [UPDATE_RIDER_ACTION]: user => user,
  [GET_DRIVER_ACTION]: user => user,
  [UPDATE_DRIVER_ACTION]: user => user,
  [GET_DRIVER_ONBOARDING_ACTION]: user => user,
  [CLEAR_DRIVER_ONBOARDING_ACTION]: user => user,
  [GET_DRIVER_DOCUMENTS_ACTION]: user => user,
  [GET_CAR_DOCUMENTS_ACTION]: user => user,
  [UPDATE_DRIVER_DOCUMENT_ACTION]: user => user,
  [CREATE_CAR_ACTION]: user => user,
  [UPDATE_CAR_ACTION]: user => user,
  [DELETE_CAR_ACTION]: user => user,
  [UPDATE_CHECKR_ACTION]: user => user,
  [CREATE_CHECKR_ACTION]: user => user,
  [GET_DRIVERS_EMAIL_HISTORY_ACTION]: user => user,
  [GET_LOST_ITEMS_ACTION]: user => user,
});

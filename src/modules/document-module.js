import { createAction, createReducer } from 'redux-action';
import { driversDocumentsAPI } from '../services/rest';

export const GET_DOCUMENTS_ACTION = 'GET_DOCUMENTS_ACTION';
export const GET_CAR_DOCUMENTS_ACTION = 'GET_CAR_DOCUMENTS_ACTION';
export const SAVE_DOCUMENT_ACTION = 'SAVE_DOCUMENT_ACTION';
export const DELETE_DOCUMENT_ACTION = 'DELETE_DOCUMENT_ACTION';


export const getDocumentsAction = createAction(GET_DOCUMENTS_ACTION, data =>
  driversDocumentsAPI.listDriverDocuments(data.userId, data.params)
    .then(result => ({action: data, result: result.data}))
);

export const getCarDocumentsAction = createAction(GET_CAR_DOCUMENTS_ACTION, data =>
  driversDocumentsAPI.listCarDocuments(data.userId, data.carId, data.params)
    .then(result => ({action: data, result: result.data}))
);

export const saveDocumentAction = createAction(SAVE_DOCUMENT_ACTION, (data) => {
  const {userId, id, driverPhotoType, carId, cityId, fileData, validityDate} = data;
  return new Promise((resolve) => {
    let promise;
    if (!id) {
      promise = driversDocumentsAPI.addDocument({
        driverId: userId,
        driverPhotoType,
        carId,
        cityId,
        fileData,
        validityDate,
      });
    } else {
      promise = driversDocumentsAPI.updateDocument(data);
    }
    promise.then(d => resolve(d.data));
  });
});

export const deleteDocumentAction = createAction(DELETE_DOCUMENT_ACTION, id =>
  driversDocumentsAPI.deleteDocument(id).then(response => ({response: response.data, id})));

export const actions = {
  getCarDocuments: getCarDocumentsAction,
  getDocuments: getDocumentsAction,
  saveDocument: saveDocumentAction,
  deleteDocument: deleteDocumentAction,
};

export const complexActions = {};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};

const initialState = {
  users: {},
  all: [],
};

const documentReducer = createReducer(initialState, {
  [GET_DOCUMENTS_ACTION]: (actionPayload, state) => {
    const params = actionPayload.action.params;
    const documentType = (params && params.documentType) ? params.documentType : 'all';
    state.all = state.all ? _.concat(state.all, actionPayload.result) : actionPayload.result;
    return {
      ...state,
      users: {
        [actionPayload.action.userId]: {
          [documentType]: actionPayload.result,
        },
      },
    };
  },
  [GET_CAR_DOCUMENTS_ACTION]: (actionPayload, state) =>
    ({...state, actionPayload, [actionPayload.action.carId]: actionPayload.result}),
  [SAVE_DOCUMENT_ACTION]: (actionPayload, state) => ({...state, actionPayload}),
  [DELETE_DOCUMENT_ACTION]: (actionPayload, state) => {
    const all = _.filter(state.all, doc => doc.id !== actionPayload.id);
    return {...state, all};
  },

});

export default documentReducer;

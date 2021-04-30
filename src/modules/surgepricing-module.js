import {createAction, createReducer} from 'redux-action';
import { showNotification } from './notifications-module';
import {surgeAreasAPI} from '../services/rest';
import { handleError } from './handle-error-module';
import constants from '../data/constants';
import jsgradient from '../helpers/gradient';

// Actions
const LOAD = 'RA/SurgePricing/LOAD';
const GET = 'RA/SurgePricing/GET';
const UPDATE_STATS = 'RA/SurgePricing/UPDATE_STATS';
const STOP_AUTO_FETCH = 'RA/SurgePricing/STOP_AUTO_FETCH';
const START_AUTO_FETCH = 'RA/SurgePricing/START_AUTO_FETCH';
const UPDATE_SURGEAREA = 'RA/SurgePricing/UPDATE_SURGEAREA';
const UPDATE_CAR_CATEGORIES = 'RA/SurgePricing/UPDATE_CAR_CATEGORIES';
const UPDATE_SURGEAREAS = 'RA/SurgePricing/UPDATE_SURGEAREAS';
const UPDATE_EDITED_SURGEAREAS = 'RA/SurgePricing/UPDATE_EDITED_SURGEAREAS';
const SET_AUTOMATION_MODE = 'RA/SurgePricing/SET_AUTOMATION_MODE';
const UPDATE_POLYGON_NAME = 'RA/SurgePricing/UPDATE_POLYGON_NAME';
const ADD_SURGEAREA = 'RA/SurgePricing/ADD_SURGEAREA';
const CREATE = 'RA/SurgePricing/CREATE';
const REMOVE_SURGEAREA = 'RA/SurgePricing/REMOVE_SURGEAREA';
const REMOVE = 'RA/SurgePricing/REMOVE';
const SELECT_POLYGON = 'RA/SurgePricing/SELECT_POLYGON';
const SORT_SURGEAREAS = 'RA/SurgePricing/SORT_SURGEAREAS';
const UPDATE_PF_MODE = 'RA/SurgePricing/UPDATE_PF_MODE';


const defaultState = {
  polygons: [],
  loading: true,
  autoFetch: false,
  currentPfMode: '',
};

let autoFetchInterval;

// Reducer
export default createReducer(defaultState, {
  [UPDATE_STATS]: surgePricing => surgePricing,
  [STOP_AUTO_FETCH]: surgePricing => surgePricing,
  [START_AUTO_FETCH]: surgePricing => surgePricing,
  [ADD_SURGEAREA]: surgePricing => surgePricing,
  [REMOVE_SURGEAREA]: surgePricing => surgePricing,
  [SORT_SURGEAREAS]: surgePricing => surgePricing,
  [UPDATE_SURGEAREAS]: surgePricing => surgePricing,
  [UPDATE_EDITED_SURGEAREAS]: surgePricing => surgePricing,
  [UPDATE_CAR_CATEGORIES]: surgePricing => surgePricing,
  [SET_AUTOMATION_MODE]: surgePricing => surgePricing,
  [UPDATE_POLYGON_NAME]: surgePricing => surgePricing,
  [SELECT_POLYGON]: surgePricing => surgePricing,
  [LOAD]: surgePricing => surgePricing,
  [GET]: surgePricing => surgePricing,
  [CREATE]: surgePricing => surgePricing,
  [UPDATE_PF_MODE]: surgePricing => surgePricing,
});

const mapSurgeFactorToColor = (surgeFactor) => {
  const step = (surgeFactor - 1) / 0.25;
  const gradient = jsgradient('#ffcccc', '#ff0000', 29);
  return gradient[step];
};

const mapPolygon = (p, maxFactor) => {
  p.fillOpacity = 0;
  p.strokeOpacity = constants.surgePricing.polygon.strokeOpacity;
  p.markerOpacity = 0;

  p.strokeWeight = constants.surgePricing.polygon.strokeWeight;
  p.strokeColor = constants.surgePricing.polygon.strokeColor;
  p.markerOpacity = constants.surgePricing.polygon.markerOpacity;
  const surgeFactor = maxFactor !== undefined ? maxFactor : p.surgeFactor;
  if (surgeFactor > 1) {
    p.fillOpacity = constants.surgePricing.polygon.fillOpacity;
    p.strokeOpacity = constants.surgePricing.polygon.strokeOpacity;
    p.fillColor = mapSurgeFactorToColor(p.surgeFactor);
  }

  if (surgeFactor <= 1 || p.carCategories.length === 0) {
    p.fillOpacity = 0;
    p.strokeOpacity = constants.surgePricing.polygon.strokeOpacity;
    p.markerOpacity = 0;
  }

  if (p.selected) {
    p.fillColor = constants.surgePricing.polygon.selectedColor;
    p.fillOpacity = constants.surgePricing.polygon.fillOpacity;
    p.strokeOpacity = constants.surgePricing.polygon.strokeOpacity;
  }

  return p;
};


const getPolygons = serverResponse =>
  _.chain(serverResponse)
  .filter(({csvGeometry}) => csvGeometry)
  .map((polygon) => {
    const polygonWithPaths = mapPolygon(polygon);

    polygonWithPaths.paths =
      polygon.csvGeometry
        .split(' ')
        .map((latLng) => {
          const [lng, lat] = latLng.split(',');
          return {lat, lng};
        });

    return polygonWithPaths;
  })
  .value();

// Action Creators
export const loadSurgePricing = createAction(LOAD, (loading = false) => ({loading}));

export const selectPolygon = createAction(SELECT_POLYGON, ({polygons, id}) => {
  const updatedPolygons = _.map(polygons, (p) => {
    p.selected = false;
    p = mapPolygon(p);
    return p;
  });

  const polygonIndex = _.findIndex(updatedPolygons, ({id: polygonId}) => polygonId === id);
  if (polygonIndex > -1) {
    updatedPolygons[polygonIndex].selected = true;
    updatedPolygons[polygonIndex] = mapPolygon(polygons[polygonIndex]);
  }

  return {polygons: updatedPolygons};
});

export const sort = sortParams => (dispatch, getState) => {
  const column = _.get(sortParams, 'column');
  const desc = _.get(sortParams, 'desc');

  const polygons = getState().surgePricing.polygons.slice();
  const isName = column === 'name';
  const isSurgeFactor = column === 'surgeFactor';
  const isCarCategories = column === 'carCategories';

  const sortedNumberData =
    _.chain(polygons)
      .filter((row) => {
        const rowValue = _.get(row, column);
        if (isName && _.isNaN(parseInt(rowValue, 10))) return false;
        return true;
      })
      .sortBy((r) => {
        const row = Object.assign({}, r);
        if (isSurgeFactor && _.isEmpty(row.carCategories)) row.surgeFactor = 0;
        if (isCarCategories) {
          row.carCategories = row.carCategories.length;
        }
        return _.toNumber(row[column]);
      })
      .value();

  const sortedData = _.chain(polygons)
    .filter((row) => {
      const rowValue = _.get(row, column);
      if (isName && _.isNaN(parseInt(rowValue, 10))) return true;
      return false;
    })
    .sortBy(row => row[column].toLowerCase())
    .value();

  if (desc) {
    sortedNumberData.reverse();
    sortedData.reverse();
  }

  const union = _.union(sortedData, sortedNumberData);

  return dispatch({
    type: SORT_SURGEAREAS,
    payload: {polygons: union, sortParams: {column, desc}},
  });
};

export const getSurgePricing = createAction(GET, (dispatch, params = {}, loading = true) => {
  dispatch(loadSurgePricing(loading));
  return surgeAreasAPI.listSurgeAreas(Object.assign({}, {avatarType: 'ADMIN'}, params))
        .then(({data}) => {
          const polygons = getPolygons(data.content);
          return { polygons, loading: false, params };
        })
        .catch((err) => {
          dispatch(handleError(err));
          dispatch(loadSurgePricing(false));
        });
});

export const getCurrentSurgeMode = createAction(GET, (dispatch, params = {}, loading = true) => {
  dispatch(loadSurgePricing(loading));

  return surgeAreasAPI.getCurrentSurgeMode(Object.assign({}, {avatarType: 'ADMIN'}, params))
    .then(({data}) => {
      const {surgeMode} = data;
      return { loading: false, currentPfMode: surgeMode, params };
    })
    .catch((err) => {
      dispatch(handleError(err));
      dispatch(loadSurgePricing(false));
    });
});


export const updatePrioritiesFareMode =
  createAction(UPDATE_PF_MODE, (dispatch, params = {}, loading = true) => {
    dispatch(loadSurgePricing(loading));
    return surgeAreasAPI.updatePrioritiesFareMode(Object.assign({}, {avatarType: 'ADMIN'}, params))
    .then(() => {
      dispatch(showNotification('Priority Fare mode was updated successfully.'));
      dispatch(loadSurgePricing(false));
      return { loading: false, currentPfMode: params.surgeMode };
    })
    .catch((err) => {
      dispatch(handleError(err));
      dispatch(loadSurgePricing(false));
    });
  });

export const updateStats = () => (dispatch, getState) =>
  surgeAreasAPI.listSurgeAreas(Object.assign({}, {avatarType: 'ADMIN'}, getState().surgePricing.params))
    .then(({data: {content}}) => {
      const polygons = getState().surgePricing.polygons.slice();
      const updatedPolygons = _.map(polygons, (p) => {
        const polygon = Object.assign({}, p);
        const newPolygon = _.find(content, {id: p.id});
        const statsKeys = [
          'numberOfAcceptedRides',
          'numberOfAvailableCars',
          'numberOfCars',
          'numberOfEyeballs',
          'numberOfRequestedRides',
          'recommendedSurgeMapping',
          'surgeFactor',
          'carCategoriesBitmask',
          'carCategoriesCars',
          'carCategoriesAvailableCars',
          'carCategoriesFactors',
          'carCategoriesRequestedRides',
          'carCategoriesAcceptedRides',
          'carCategoriesNumberOfEyeballs',
          'automated',
        ];

        if (newPolygon) {
          _.forEach(statsKeys, (key) => {
            polygon[key] = newPolygon[key];
          });
        }

        return polygon;
      });
      return dispatch({
        type: UPDATE_STATS,
        payload: {polygons: updatedPolygons},
      });
    })
    .catch(err => dispatch(handleError(err)));

export const startAutoFetch = () => (dispatch) => {
  clearInterval(autoFetchInterval);
  autoFetchInterval = setInterval(() => {
    dispatch(updateStats());
  }, 10000);
  return dispatch({
    type: START_AUTO_FETCH,
    payload: {
      autoFetch: true,
    },
  });
};

export const stopAutoFetch = createAction(STOP_AUTO_FETCH, () => {
  clearInterval(autoFetchInterval);
  return { autoFetch: false };
});

export const updateSurgeAreas = polygon => (dispatch, getState) => {
  const polygons = getState().surgePricing.polygons.slice();
  const polygonIndex = _.findIndex(polygons, {id: polygon.id});
  if (polygonIndex > -1) {
    let maxFactor = 1;
    Object.values(polygon.carCategoriesFactors).forEach((e) => {
      if (e > maxFactor) maxFactor = e;
    });
    polygons[polygonIndex] = mapPolygon(polygon, maxFactor);
  }
  return dispatch({
    type: UPDATE_SURGEAREAS,
    payload: {polygons},
  });
};

// export const updateEditedSurgeAreas =
//   createAction(UPDATE_EDITED_SURGEAREAS, (dispatch, newPolygons, loading = true) => {
//     dispatch(loadSurgePricing(loading));
//     return surgeAreasAPI.updateSurgeAreas(newPolygons).then(({data}) => {
//       dispatch(loadSurgePricing(false));
//       return data;
//     });
//   });

export const updateEditedSurgeAreas =
  createAction(UPDATE_EDITED_SURGEAREAS, (dispatch, polygons, loading = true) => {
    dispatch(loadSurgePricing(loading));
    const newPolygons = _.map(polygons, (surgeArea) => {
      surgeArea.surgeFactors = surgeArea.carCategoriesFactors;
      if (Object.keys(surgeArea.surgeFactors).length !== surgeArea.carCategories.length) {
        const newSurgeFators = {};
        for (let i = 0; i < surgeArea.carCategories.length; i++) {
          const carCategory = surgeArea.carCategories[i];
          if (carCategory in surgeArea.surgeFactors) {
            newSurgeFators[carCategory] = surgeArea.surgeFactors[carCategory];
          } else {
            newSurgeFators[carCategory] = 1;
          }
        }
        surgeArea.surgeFactors = newSurgeFators;
        surgeArea.carCategoriesFactors = newSurgeFators;
      }
      dispatch(updateSurgeAreas(surgeArea));
      return surgeArea;
    });
    return surgeAreasAPI.updateSurgeAreas(newPolygons).then(({data}) => {
      dispatch(loadSurgePricing(false));
      return data;
    });
  });

export const updateSurgePricing =
  createAction(UPDATE_SURGEAREA, (dispatch, surgeArea, params) => {
    surgeArea.surgeFactors = surgeArea.carCategoriesFactors;
    if (Object.keys(surgeArea.surgeFactors).length !== surgeArea.carCategories.length) {
      const newSurgeFators = {};
      for (let i = 0; i < surgeArea.carCategories.length; i++) {
        const carCategory = surgeArea.carCategories[i];
        if (carCategory in surgeArea.surgeFactors) {
          newSurgeFators[carCategory] = surgeArea.surgeFactors[carCategory];
        } else {
          newSurgeFators[carCategory] = 1;
        }
      }
      surgeArea.surgeFactors = newSurgeFators;
      surgeArea.carCategoriesFactors = newSurgeFators;
    }
    dispatch(updateSurgeAreas(surgeArea));
    return surgeAreasAPI.updateSurgeArea({surgeArea, surgeAreaId: surgeArea.id})
    .then(({data}) => {
      dispatch(showNotification(`${surgeArea.name} was updated successfully.`));
      return data;
    })
    .catch((err) => {
      dispatch(getSurgePricing(dispatch, params));
      dispatch(handleError(err));
    });
  });

export const updateCarCategories =
  createAction(UPDATE_CAR_CATEGORIES, (dispatch, surgeArea) => {
    surgeArea.surgeFactors = surgeArea.carCategoriesFactors;
    if (Object.keys(surgeArea.surgeFactors).length !== surgeArea.carCategories.length) {
      const newSurgeFators = {};
      for (let i = 0; i < surgeArea.carCategories.length; i++) {
        const carCategory = surgeArea.carCategories[i];
        if (carCategory in surgeArea.surgeFactors) {
          newSurgeFators[carCategory] = surgeArea.surgeFactors[carCategory];
        } else {
          newSurgeFators[carCategory] = 1;
        }
      }
      surgeArea.surgeFactors = newSurgeFators;
      surgeArea.carCategoriesFactors = newSurgeFators;
    }
    dispatch(updateSurgeAreas(surgeArea));
    return surgeArea;
  });


export const setAutomationMode = createAction(SET_AUTOMATION_MODE,
  (dispatch, surgeArea, automated = false) => {
    const newPolygon = Object.assign({}, surgeArea, {automated});
    dispatch(updateSurgeAreas(newPolygon));
    return newPolygon;
  });

export const updatePolygonName = createAction(UPDATE_POLYGON_NAME, (dispatch, surgeArea) => {
  const newPolygon = Object.assign({}, surgeArea, {name: surgeArea.name});
  dispatch(updateSurgeAreas(newPolygon));
  return newPolygon;
});


export const addSurgeArea = polygon => (dispatch, getState) => {
  const polygons = [...getState().surgePricing.polygons.slice(), polygon];
  return dispatch({
    type: ADD_SURGEAREA,
    payload: {polygons},
  });
};

export const createSurgePricing =
  createAction(CREATE, ((dispatch, surgeArea) =>
    surgeAreasAPI.createSurgeArea({surgeArea})
      .then(({data}) => {
        const polygonWithPaths = mapPolygon(data);

        polygonWithPaths.paths =
          data.csvGeometry
            .split(' ')
            .map((latLng) => {
              const [lng, lat] = latLng.split(',');
              return {lat, lng};
            });
        dispatch(showNotification(`${surgeArea.name} was successfully created.`));
        dispatch(addSurgeArea(polygonWithPaths));
      })
      .catch((err) => {
        dispatch(getSurgePricing(dispatch));
        dispatch(handleError(err));
      })
  ));

export const removeSurgeArea = ({id}) => (dispatch, getState) => {
  const polygons = _.filter(getState().surgePricing.polygons.slice(), p => p.id !== id);
  return dispatch({
    type: REMOVE_SURGEAREA,
    payload: {polygons},
  });
};

export const removeSurgePricing =
  createAction(REMOVE, (dispatch, surgeArea) => {
    dispatch(removeSurgeArea(surgeArea));
    return surgeAreasAPI.removeSurgeArea({surgeAreaId: surgeArea.id})
    .then(() => {
      dispatch(showNotification(`${surgeArea.name} was successfully deleted.`));
    })
    .catch((err) => {
      dispatch(getSurgePricing(dispatch));
      dispatch(handleError(err));
    });
  });

export const complexActions = {
  getSurgePricing,
  updateSurgePricing,
  createSurgePricing,
  removeSurgePricing,
  updatePrioritiesFareMode,
  getCurrentSurgeMode,
  updateEditedSurgeAreas,
  updateCarCategories,
  setAutomationMode,
  updatePolygonName,
};

export const actions = {
  selectPolygon,
  sort,
  stopAutoFetch,
  startAutoFetch,
  loadSurgePricing,
  showNotification,
  handleError,
};

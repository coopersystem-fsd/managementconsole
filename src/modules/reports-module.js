import { createAction, createReducer } from 'redux-action';
import reportsService from '../services/rest/reports';
import { handleError } from './handle-error-module';
import adaptReportFields from '../helpers/mappers';

const REPORTS_STATE_CHANGED = 'REPORTS_STATE_CHANGED';
export const GET_RIDES_COUNT_REPORT = 'GET_RIDES_COUNT_REPORT';
export const GET_REPORTS_ACTION = 'GET_REPORTS_ACTION';
export const GET_REPORT_ACTION = 'GET_REPORT_ACTION';
export const GET_REPORT_PARAMETRS_ACTION = 'GET_REPORT_PARAMETRS_ACTION';
export const EXECUTE_REPORT_ACTION = 'EXECUTE_REPORT_ACTION';
export const GET_CUMULATIVE_RIDES_REPORT_ACTION = 'GET_CUMULATIVE_RIDES_REPORT_ACTION';

const reportStateChange = createAction(REPORTS_STATE_CHANGED, data => data);

const getRidesCountReportAction = createAction(GET_RIDES_COUNT_REPORT, (dispatch, data) =>
  reportsService.ridesZipCodeReport({ avatarType: 'ADMIN', ...data })
  .then(response => response.data)
  .catch((err) => {
    dispatch(handleError(err));
  })
);

const getReportsAction = createAction(GET_REPORTS_ACTION, (dispatch, data) =>
  reportsService.listReports({avatarType: 'ADMIN', ...data})
    .then(response => response.data)
    .catch(err => dispatch(handleError(err)))
);

const getReportAction = createAction(GET_REPORT_ACTION, () => {});

const getReportParametrsAction = createAction(GET_REPORT_PARAMETRS_ACTION, (dispatch, data, id) =>
  reportsService.getReportParameters({ avatarType: 'ADMIN', ...data }, id)
  .then(response => ({ fields: response.data, id }))
  .catch(err => dispatch(handleError(err)))
);

const executeReportAction =
  createAction(EXECUTE_REPORT_ACTION, (dispatch, parameters, selectedReport) => {
    dispatch(reportStateChange({ loadingReportExecute: true }));
    return reportsService.executeReport(parameters, selectedReport)
      .then(response => response.data)
      .catch(err => dispatch(handleError(err)));
  });

const getCumulativeRidesReportAction =
  createAction(GET_CUMULATIVE_RIDES_REPORT_ACTION, (dispatch, data) => {
    dispatch(reportStateChange({ loadingRidesReport: true }));
    return reportsService.getCumulativeRidesReport({avatarType: 'ADMIN', ...data})
      .then((response) => {
        dispatch(reportStateChange({ loadingRidesReport: false }));
        return response.data;
      })
      .catch(err => dispatch(handleError(err)));
  });

export const actions = {};

export const complexActions = {
  getReports: getReportsAction,
  getReport: getReportAction,
  getReportParametrs: getReportParametrsAction,
  executeReport: executeReportAction,
  getRidesCountReport: getRidesCountReportAction,
  getCumulativeRidesReport: getCumulativeRidesReportAction,
};

// All actions
export const allActions = {
  ...actions,
  ...complexActions,
};


const initialState = {
  zipCodeOptions: [
    { value: 'n/a', label: 'n/a'},
  ],
  reportFields: [],
  availableReports: [],
  loadingRidesReport: false,
  loadingReportModal: false,
  loadingReportExecute: false,
};

const reportsReducer = createReducer(initialState, {
  [GET_RIDES_COUNT_REPORT]: (actionPayload, state) => {
    const codes = [];
    // actionPayload.forEach((zip) => {
    //   // need to check here because test servers may have malicious data
    //   codes.push({value: zip.zipCode || 'N/A', label: zip.zipCode || 'N/A' });
    // });
    return { ...state, zipCodeOptions: codes };
  },
  [GET_REPORTS_ACTION]: (actionPayload, state) => {
    const reports = actionPayload.content.map(report =>
      ({
        value: report.id,
        label: report.reportName,
      })
    );
    return { ...state, availableReports: reports };
  },
  [GET_REPORT_ACTION]: (actionPayload, state) => ({ ...state, usersListData: actionPayload }),
  [REPORTS_STATE_CHANGED]: (actionPayload, state) => ({ ...state, ...actionPayload }),
  [GET_REPORT_PARAMETRS_ACTION]: (actionPayload, state) => {
    const reportFields = adaptReportFields(actionPayload.fields, actionPayload.id);
    return { ...state, reportFields };
  },
  [EXECUTE_REPORT_ACTION]: (actionPayload, state) => ({ ...state, lastExecutedReport: false }),
  [GET_CUMULATIVE_RIDES_REPORT_ACTION]: (actionPayload, state) =>
    ({ ...state, cumulativeRidesReport: actionPayload }),
});


export default reportsReducer;

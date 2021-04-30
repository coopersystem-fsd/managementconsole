import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { actions, complexActions } from '../modules/statistics-module';
import StatisticsComponent from '../components/Statistics';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  statistics: state.statistics,
  common: state.common,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators(
        actions,
        dispatch
    ),
    ...bindComplexActionCreators(
        complexActions,
        dispatch
    ),
  },
  loadRidesReport: (params = {}) => {
    Object.assign(params, {reportID: 'ridesReport'});
    return dispatch(complexActions.getReport(dispatch, params));
  },
  loadDriverRidesReport: (params = {sort: 'completedRides'}) => {
    Object.assign(params, {reportID: 'driversRidesReport'});
    return dispatch(complexActions.getReport(dispatch, params));
  },
  loadRidesZipCodeReport: (params = {}) => {
    Object.assign(params, {reportID: 'ridesZipCodeReport'});
    return dispatch(complexActions.getReport(dispatch, params));
  },
  loadTrackingReport: (params = {}) => {
    Object.assign(params, {reportID: 'trackingReport'});
    return dispatch(complexActions.getReport(dispatch, params));
  },
});

const Container = StatisticsComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

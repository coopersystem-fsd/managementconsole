import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import { actions, complexActions } from '../modules/reports-module';
import ReportsComponent from '../components/Reports';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  zipCodeOptions: state.reports.zipCodeOptions,
  availableReports: state.reports.availableReports,
  loadingRidesReport: state.reports.loadingRidesReport,
  loadingReportExecute: state.reports.loadingReportExecute,
  loadingReportModal: state.reports.loadingReportModal,
  cumulativeRidesReport: state.reports.cumulativeRidesReport,
  reportFields: state.reports.reportFields,
  carCategories: state.common.carTypesMap ? state.common.carTypesMap.allItems : [],
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
});

const Container = ReportsComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

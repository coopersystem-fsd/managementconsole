import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import RealTimeTracking from '../components/RealTimeTracking';
import { actions, complexActions } from '../modules/real-time-tracking-module';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  common: state.common,
  trackingData: state.trackingData,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RealTimeTracking);

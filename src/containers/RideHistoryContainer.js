import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, complexActions } from '../modules/ride-history-module';
import RideHistoryComponent from '../components/RideHistory';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  rideHistory: state.rideHistory,
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
});

const Container = RideHistoryComponent;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

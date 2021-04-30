import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import RidesComponent from '../components/Rides';
import { actions, complexActions } from '../modules/rides-module';
import * as notifications from '../modules/notifications-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state =>
({
  common: state.common,
  user: state.login.user,
  stuckRides: state.rides.stuckRides,
  loadingStuckRides: state.rides.loadingStuckRides,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators(
      actions,
      dispatch,
    ),
    ...bindComplexActionCreators(
        complexActions,
        dispatch,
    ),
  },
  notificationsActions: bindActionCreators(
    notifications,
    dispatch
  ),
});

const Container = RidesComponent;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import {Ride} from '../components';
import { actions, complexActions } from '../modules/ride-module';
import * as notifications from '../modules/notifications-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  ride: state.ride,
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
        dispatch
    ),
  },
  notificationsActions: bindActionCreators(
    notifications,
    dispatch
  ),
});

const Container = Ride;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

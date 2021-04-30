import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {bindComplexActionCreators} from 'rrmb-generator-utils';
import DriverFunnelComponent from '../components/DriverFunnel';
import { actions, complexActions } from '../modules/driver-funnel-module';
import { actions as userActions, complexActions as userComplexActions } from '../modules/user-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  driverFunnel: state.driverFunnel,
  common: state.common,
  login: state.login,
  user: state.user,
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
  userActions: {
    ...bindActionCreators(
        userActions,
        dispatch
    ),
    ...bindComplexActionCreators(
        userComplexActions,
        dispatch
    ),
  },
});

const Container = DriverFunnelComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

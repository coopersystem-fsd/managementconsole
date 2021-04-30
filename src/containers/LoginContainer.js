import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import { browserHistory } from 'react-router';

import LoginComponent from '../components/Login';
import { actions, complexActions } from '../modules/login-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = ({login}) => ({
  isLogged: login.isLogged,
  error: login.error,
  logging: login.logging,
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
  handleForgotPasswordClick: () => {
    browserHistory.push('/forget-password');
  },
});

const Container = LoginComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import ForgetPasswordComponent from '../components/ForgetPassword';
import { actions, complexActions } from '../modules/forget-password-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = () => ({});

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

  handleSignInClick: () => {
    browserHistory.push('login');
  },

});

const Container = ForgetPasswordComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

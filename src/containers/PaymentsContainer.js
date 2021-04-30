import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {bindComplexActionCreators} from 'rrmb-generator-utils';
import PaymentsComponent from '../components/Payments';
import { actions, complexActions } from '../modules/payments-module';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  selectedCity: state.common.selectedCity,
  payments: state.payments,
  common: state.common,
  login: state.login,
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

const Container = PaymentsComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

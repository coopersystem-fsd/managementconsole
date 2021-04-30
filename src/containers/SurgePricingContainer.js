import { connect } from 'react-redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import { bindActionCreators } from 'redux';
import { complexActions, actions } from '../modules/surgepricing-module';
import { hideNotification } from '../modules/notifications-module';
import {SurgePricing} from '../components';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  surgePricing: state.surgePricing,
  common: state.common,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindComplexActionCreators(
      complexActions,
      dispatch
    ),
    ...bindActionCreators(
      actions,
      dispatch
    ),
    ...bindActionCreators(
      {
        hideNotification,
      },
      dispatch,
    ),
  },

});

const Container = SurgePricing;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

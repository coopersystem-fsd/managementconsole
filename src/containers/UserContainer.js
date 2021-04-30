import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, complexActions } from '../modules/user-module';
import UserComponent from '../components/User';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  user: state.user,
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

const Container = UserComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

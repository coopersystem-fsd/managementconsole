import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, complexActions } from '../modules/profile-module';
import Profile from '../components/Profile';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  profile: state.profile,
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

const Container = Profile;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

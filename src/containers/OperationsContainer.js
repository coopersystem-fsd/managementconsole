import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import {Operations} from '../components';
import { actions, complexActions } from '../modules/operations-module';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state =>
({
  operations: state.operations,
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Operations);

import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, complexActions } from '../modules/ratings-module';
import Ratings from '../components/User/Ratings';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  ratings: state.ratings,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Ratings);

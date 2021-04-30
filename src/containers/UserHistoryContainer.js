import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../modules/user-history-module';
import Component from '../components/UserHistory';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  userHistory: state.userHistory,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators(
        actions,
        dispatch
    ),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

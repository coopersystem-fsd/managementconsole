import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import TncComponent from '../components/TNC/TNCView';
import { actions, complexActions } from '../modules/document-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  user: state.user.data.user,
  document: state.document,
  cities: state.common.cities,
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

const Container = TncComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

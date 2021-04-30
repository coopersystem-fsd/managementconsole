import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { actions, complexActions } from '../modules/drivers-import-module';
import DriversImport from '../components/DriversImport';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  driversImport: state.driversImport,
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
        dispatch
    ),
  },
});

const Container = DriversImport;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, complexActions } from '../modules/upgrades-module';
import UpgradesComponent from '../components/Upgrades';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  upgrades: state.upgrades,
  selectedCity: state.common.selectedCity,
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

const Container = UpgradesComponent;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

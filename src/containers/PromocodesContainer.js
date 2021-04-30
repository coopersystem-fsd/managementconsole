import {bindComplexActionCreators} from 'rrmb-generator-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, complexActions } from '../modules/promocodes-module';
import {Promocodes} from '../components';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  promocodes: state.promocodes,
  cities: state.common.cities,
  selectedCity: state.common.selectedCity,
  carTypes: state.common.carTypesMap ? state.common.carTypesMap.allItems : [],
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

const Container = Promocodes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

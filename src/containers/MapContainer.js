import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import MapComponent from '../components/Map';
import { actions, complexActions } from '../modules/map-module';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  map: state.map,
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

const Container = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapComponent);

export default Container;

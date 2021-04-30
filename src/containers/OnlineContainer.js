import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';

import {Online} from '../components';
import { actions, complexActions } from '../modules/online-module';

function getOnlineDrivers(cityChange) {
  const params =
    cityChange ?
      Object.assign({}, this.online.onlineDriversParams, {page: 0}) :
      this.online.onlineDriversParams;
  return this.actions.getOnlineDrivers(params);
}

function getAAADrivers(cityChange) {
  const params =
    cityChange ?
      Object.assign({}, this.online.AAADriversParams, {page: 0}) :
      this.online.AAADriversParams;
  return this.actions.getAAADrivers(params);
}

function getLocation(driver) {
  return this.actions.getDriverLocation(driver);
}

function pageChange(params) {
  return this.actions.pageChange(Object.assign({}, this.online[`${params.type}Params`], params));
}

function getRequestedDrivers(cityChange) {
  const params =
    cityChange ?
      Object.assign({}, this.online.requestedDriversParams, {page: 0}) :
      this.online.requestedDriversParams;
  return this.actions.getRequestedDrivers(params);
}

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  online: state.online,
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
  getOnlineDrivers,
  getAAADrivers,
  getRequestedDrivers,
  pageChange,
  getLocation,
});

const Container = Online;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

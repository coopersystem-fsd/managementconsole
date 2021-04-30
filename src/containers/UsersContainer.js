import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {bindComplexActionCreators} from 'rrmb-generator-utils';

import UsersComponent from '../components/Users';
import { actions, complexActions } from '../modules/users-module';
import { handleError } from '../modules/handle-error-module';
import { sendDriversReport, sendRidersReport } from '../services/api';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  carTypesMap: state.common.carTypesMap,
  user: state.login.user,
  usersListData: state.users.usersListData,
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
  sendDriversReport: params =>
    sendDriversReport(params)
      .catch(err => dispatch(handleError(err))),
  sendRidersReport: params =>
    sendRidersReport(params)
      .catch(err => dispatch(handleError(err))),
});

const Container = UsersComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

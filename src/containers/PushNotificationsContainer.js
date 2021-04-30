import { connect } from 'react-redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';
import { complexActions } from '../modules/push-notifications-module';
import PushNotificationsComponent from '../components/PushNotifications';


// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  pushNotifications: state.pushNotifications,
});

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindComplexActionCreators(
      complexActions,
      dispatch
    ),
  },
});

const Container = PushNotificationsComponent;


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

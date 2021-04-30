import { combineReducers } from 'redux';

// BOT: Reducer imports here
import common from './modules/common-module';
import documentReducer from './modules/document-module';
import driverFunnelReducer from './modules/driver-funnel-module';
import driversImportReducer from './modules/drivers-import-module';
import errorReducer from './modules/handle-error-module';
import forgetPasswordReducer from './modules/forget-password-module';
import loginReducer from './modules/login-module';
import mapReducer from './modules/map-module';
import notifications from './modules/notifications-module';
import onlineReducer from './modules/online-module';
import operationsReducer from './modules/operations-module';
import paymentsReducer from './modules/payments-module';
import profileReducer from './modules/profile-module';
import promocodesReducer from './modules/promocodes-module';
import pushNotificationsReducer from './modules/push-notifications-module';
import ratingsReducer from './modules/ratings-module';
import realTimeTrackingReducer from './modules/real-time-tracking-module';
import reportsReducer from './modules/reports-module';
import rideHistoryReducer from './modules/ride-history-module';
import rideReducer from './modules/ride-module';
import ridesReducer from './modules/rides-module';
import statisticsReducer from './modules/statistics-module';
import surgePricing from './modules/surgepricing-module';
import testEndpointReducer from './modules/test-endpoint-module';
import upgradesReducer from './modules/upgrades-module';
import userHistoryReducer from './modules/user-history-module';
import userReducer from './modules/user-module';
import usersReducer from './modules/users-module';

const rootReducer = combineReducers({
  common,
  surgePricing,
  notifications,
  // BOT: Reducer list here
  document: documentReducer,
  driverFunnel: driverFunnelReducer,
  driversImport: driversImportReducer,
  errors: errorReducer,
  forgetPassword: forgetPasswordReducer,
  login: loginReducer,
  map: mapReducer,
  online: onlineReducer,
  operations: operationsReducer,
  payments: paymentsReducer,
  profile: profileReducer,
  promocodes: promocodesReducer,
  pushNotifications: pushNotificationsReducer,
  ratings: ratingsReducer,
  reports: reportsReducer,
  ride: rideReducer,
  rideHistory: rideHistoryReducer,
  rides: ridesReducer,
  statistics: statisticsReducer,
  testEndpoint: testEndpointReducer,
  trackingData: realTimeTrackingReducer,
  upgrades: upgradesReducer,
  user: userReducer,
  userHistory: userHistoryReducer,
  users: usersReducer,
});

export default rootReducer;

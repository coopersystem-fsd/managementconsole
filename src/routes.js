import 'babel-polyfill';
import React from 'react';
import { Provider } from 'react-redux';
import {
  browserHistory,
  Router,
  Route,
  IndexRedirect,
} from 'react-router';

import {isAuth} from './helpers/auth';
import * as Pages from './containers';

import Dashboard from './containers/Dashboard';
import NoRoute from './components/NoRoute';
import Redirect from './components/common/Redirect';
import Version from './components/Version';
import requireAuth from './containers/RequireAuth';
import Root from './containers/Root';
import store from './store';

const routes = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/real-time-tracking/:token" component={Pages.RealTimeTrackingContainer} />
      <Route path="/redirect/https" component={Redirect} />
      <Route path="/" component={Root}>
        <IndexRedirect to="/online" />
        <Route component={requireAuth(Dashboard)}>
          {/* BOT: NEXT ROUTE */}
          <Route path="/test" component={requireAuth(Pages.EndpointTestContainer, ['ADMIN'])} />
          <Route path="/:type/edit/:userID" component={requireAuth(Pages.UserContainer, ['ADMIN'])} />
          <Route path="/:userType/history/:userId" component={requireAuth(Pages.RideHistoryContainer, ['ADMIN'])} />
          <Route path="/map" component={requireAuth(Pages.MapContainer, ['ADMIN'])} />
          <Route path="/notifications" component={Pages.PushNotificationsContainer} />
          <Route path="/onboarding" component={requireAuth(Pages.DriverFunnelContainer, ['ADMIN'])} />
          <Route path="/online" component={requireAuth(Pages.OnlineContainer, ['ADMIN'])} />
          <Route path="/operations" component={requireAuth(Pages.OperationsContainer, ['ADMIN'])} />
          <Route path="/payments" component={requireAuth(Pages.PaymentsContainer, ['ADMIN'])} />
          <Route path="/profile/:type/:id/payments" component={requireAuth(Pages.PaymentsContainer, ['ADMIN'])} />
          <Route path="/profile/:userType/:userId" component={requireAuth(Pages.ProfileContainer, ['ADMIN', 'RIDER', 'DRIVER'])} />
          <Route path="/promocodes" component={requireAuth(Pages.PromocodesContainer, ['ADMIN'])} />
          <Route path="/reports" component={requireAuth(Pages.ReportsContainer, ['ADMIN'])} />
          <Route path="/ride/:rideID" component={requireAuth(Pages.RideContainer, ['ADMIN'])} />
          <Route path="/rides" component={requireAuth(Pages.RidesContainer, ['ADMIN'])} />
          <Route path="/statistics" component={requireAuth(Pages.StatisticsContainer, ['ADMIN'])} />
          <Route path="/surgepricing" component={requireAuth(Pages.SurgePricingContainer, ['ADMIN'])} />
          <Route path="/upgrades" component={requireAuth(Pages.UpgradesContainer, ['ADMIN'])} />
          <Route path="/users" component={requireAuth(Pages.UsersContainer, ['ADMIN'])} />
          <Route path="/version" component={requireAuth(Version, ['ADMIN'])} />
        </Route>
        <Route path="/login" component={Pages.LoginContainer} onEnter={isAuth} />
        <Route path="/forget-password" component={Pages.ForgetPasswordContainer} />
        <Route path="*" component={NoRoute} />
      </Route>
    </Router>
  </Provider>);

export default routes;

import React, { Component } from 'react';
import { connect } from 'react-redux';
import NotificationSystem from 'react-notification-system';

import { hideNotification } from '../../modules/notifications-module';
import { clearError } from '../../modules/handle-error-module';


class Notifications extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
    };
    this.renderError = this.renderError.bind(this);
    this.renderNotification = this.renderNotification.bind(this);
    this.notifications = [];
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onNotificationClose() {
    this.props.dispatch(hideNotification());
  }

  onErrorClose() {
    this.props.dispatch(clearError());
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {notifications, errors} = props;
    this.renderNotification(notifications);
    this.renderError(errors);
  }

  renderError(errors = {}) {
    const data = _.get(errors.error, 'data');
    const message = _.get(errors.error, 'message');
    const dataOrMessage = data || message;
    const showError = _.get(errors.error, 'showError');
    const isUnique = this.notifications.indexOf(data || message) === -1;

    if (showError && isUnique) {
      this.notifications = _.xor(this.notifications, [dataOrMessage]);
      this.notificationSystem.addNotification({
        message: dataOrMessage,
        position: 'tc',
        level: 'error',
        onRemove: () => {
          this.notifications = _.xor(this.notifications, [dataOrMessage]);
          this.onErrorClose();
        },
      });
    }
    return null;
  }

  renderNotification(notifications = {}) {
    if (
      notifications &&
      notifications.message &&
      this.notifications.indexOf(notifications.message) === -1
    ) {
      this.notifications = _.xor(this.notifications, [notifications.message]);
      this.notificationSystem.addNotification({
        message: notifications.message,
        position: 'tc',
        level: 'warning',
        onRemove: () => {
          this.notifications = _.xor(this.notifications, [notifications.message]);
          this.onNotificationClose();
        },
      });
    }
    return null;
  }

  render() {
    return <NotificationSystem ref={(ref) => { this.notificationSystem = ref; }} />;
  }
}

function mapStateToProps(state) {
  return {
    errors: state.errors,
    notifications: state.notifications,
  };
}

export default connect(mapStateToProps)(Notifications);

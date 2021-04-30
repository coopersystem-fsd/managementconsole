import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import {Panel, Button, Col, Row} from 'react-bootstrap';
import styles from './PushNotifications.scss';
import FormField from '../common/FormField';
import fieldValidation from '../common/fieldValidation';
import constants from '../../data/constants';
import Loading from '../Loading';

class PushNotifications extends Component { // eslint-disable-line react/prefer-stateless-function
  // Props Types
  static propTypes = {
  }

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      topic: null,
      message: '',
    };
  }

  componentDidMount() {
    this.onInit();
  }

  onInit() {
    this.props.actions.listNotifications()
      .then(({payload: {topics = []}}) => {
        const fields = _.map(constants.pushNotifications, (field) => {
          field.validation = fieldValidation(field);
          if (field.id === 'topics') {
            field.allValues = this.props.pushNotifications.topics;
            field.value = topics[0].id;
          } else {
            field.value = '';
          }
          return field;
        });
        this.setState({fields});
      });
  }

  onSend() {
    const fields = this.state.fields.slice();
    const topicId = _.find(fields, {id: 'topics'}).value;
    const message = _.find(fields, {id: 'message'});
    this.setState({loading: true});
    this.props.actions.sendNotification({topicId, message: message.value})
      .then(() => {
        this.setState({loading: false});
        this.handleFieldChange('', message);
      });
  }

  isFieldInvalid() {
    return Boolean(_.chain(this.state.fields)
      .map(({validation, value}) => validation(value))
      .reduce((a, b) => a + b)
      .value());
  }

  handleFieldChange(newValue, field) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    fields[fieldIndex].value = newValue || '';
    this.setState({fields});
  }

  renderFields() {
    if (this.state.fields) {
      return (
        _.map(this.state.fields, field =>
          <Row key={field.id}>
            <FormField
              hasErrors={field.validation(field.value) ? 'error' : null}
              field={field}
              onChange={v => this.handleFieldChange(v, field)}
            />
          </Row>)
      );
    }
    return false;
  }

  renderPushNotification() {
    if (this.props.pushNotifications.topics) {
      return (
        <Col sm={6} xs={12}>
          <Panel header="Send Push Notification">
            {this.renderFields()}
            <Button
              disabled={this.state.loading || this.isFieldInvalid()}
              onClick={() => this.onSend()}
            >{this.state.loading ? 'Sending...' : 'Send Notification'}
            </Button>
          </Panel>
        </Col>
      );
    }
    return false;
  }

  render() {
    if (this.state.fields) {
      return (
        <div className={styles.pushNotifications}>
          {this.renderPushNotification()}
        </div>
      );
    }
    return <Loading loading />;
  }
}

export default cssModules(PushNotifications, styles);

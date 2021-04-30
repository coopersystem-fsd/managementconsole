import React, { Component } from 'react';
import {
  ButtonToolbar,
  Button,
  Modal,
  Form,
  Alert,
  Label,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import styles from './Payments.scss';
import FormField from '../common/FormField';
import constants from '../../data/constants';
import fieldValidation, {validateFields} from '../common/fieldValidation';
import {getTexasTime} from '../../helpers/common';

class Payments extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onSave() {
    this.setState({loading: true, error: false});
    this.props.onChange(this.getFields())
      .then(({payload: {error}}) => {
        this.setState({loading: false, error});
        if (!error) this.onClose(true);
      });
  }

  onClose(reload) {
    const fields = _.map(this.state.fields, (field) => {
      if (field.id === 'type') {
        field.value = 'BONUS';
      } else {
        field.value = '';
      }
      return field;
    });
    this.setState({fields});
    this.props.onClose(reload);
  }

  getFields() {
    const params = {};
    _.forEach(this.state.fields, (f) => {
      if (moment.isMoment(f.value)) {
        if (f.id === 'createAfter' || f.id === 'paymentDate') params[f.id] = getTexasTime(f.value.startOf('day')).toISOString();
        if (f.id === 'createBefore') params[f.id] = getTexasTime(f.value.endOf('day')).toISOString();
      } else {
        params[f.id] = f.value;
      }
    });
    params.recipient = this.props.user.email;
    return params;
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const state = { show: props.show };

    state.fields =
    _.chain(constants.exportPayments.slice())
      .map((field) => {
        const propsField = props.fields[field.id] || {};
        field.value = propsField.value ? propsField.value : field.value || '';
        field.validation = fieldValidation(field);
        return field;
      })
      .value();
    this.setState(state);
  }

  isFieldInvalid() {
    return validateFields(this.state.fields);
  }

  handleFieldChange(newValue, field) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    fields[fieldIndex].value = newValue || '';
    if (this.props.onFieldValueChange) {
      this.props.onFieldValueChange(fields[fieldIndex], fields);
    }
    this.setState({fields});
  }

  renderFields() {
    if (this.state.fields) {
      return (
        _.map(this.state.fields, field =>
          <FormField
            key={field.id}
            hasErrors={field.validation(field) ? 'error' : null}
            field={field}
            onChange={v => this.handleFieldChange(v, field)}
          />)
      );
    }
    return false;
  }

  render() {
    return (
      <Modal show={this.props.show} backdrop="static" dialogClassName="export-payment-modal">
        <Modal.Header>
          <Modal.Title>Export Payments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.error &&
            <Alert bsStyle="danger">
              {this.state.error}
            </Alert>
          }
          <div className="bottom15">Export will be sent to email: <Label>{this.props.user.email}</Label></div>
          <Form horizontal>
            {this.renderFields()}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button
              bsStyle="danger"
              disabled={this.state.loading}
              onClick={() => this.props.onClose()}
            >Cancel</Button>
            <Button
              bsStyle="primary"
              disabled={this.state.loading || this.isFieldInvalid()}
              onClick={() => { this.onSave(); }}
            >Send Payments Export</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default cssModules(Payments, styles);

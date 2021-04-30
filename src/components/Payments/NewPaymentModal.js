import React, { Component } from 'react';
import {
  ButtonToolbar,
  Button,
  Modal,
  Form,
  Alert,
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
      if (f.id === 'paymentDate') {
        params[f.id] = getTexasTime(f.value.startOf('day')).toISOString();
      } else {
        params[f.id] = f.value;
      }
    });
    return params;
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const state = { show: props.show };
    state.fields =
    _.chain(constants.newPayment.slice())
      .map((field) => {
        field.value = field.value || '';
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
      <Modal show={this.props.show} backdrop="static" dialogClassName="new-payment-modal">
        <Modal.Header>
          <Modal.Title>New Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.error &&
            <Alert bsStyle="danger">
              {this.state.error}
            </Alert>
          }
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
            >Save New Payment</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default cssModules(Payments, styles);

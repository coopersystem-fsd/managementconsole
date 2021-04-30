import React, { Component } from 'react';
import {
  ButtonToolbar,
  Button,
  Modal,
  Form,
  Alert,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import styles from './Upgrades.scss';
import FormField from '../common/FormField';
import constants from '../../data/constants';
import fieldValidation from '../common/fieldValidation';

class EditUpgradesModal extends Component { // eslint-disable-line react/prefer-stateless-function
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
    this.setState({fields: null});
    this.props.onClose(reload);
  }

  getFields() {
    const params = {};
    _.forEach(this.state.fields, (f) => {
      if (f.type === 'checkbox') {
        params[f.id] = f.value.indexOf(f.id) > -1;
      } else {
        params[f.id] = f.value;
      }
    });
    params.cityId = this.props.selectedCity;
    return params;
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const state = { show: props.show };
    state.fields =
    _.chain(constants.upgrades.slice())
      .filter((f) => {
        if (f.upgradeType === 'edit') {
          return !_.isEmpty(props.edit);
        }
        return true;
      })
      .map((f) => {
        const field = Object.assign({}, f);
        field.value = field.value || '';
        if (props.edit && props.edit[field.id]) {
          field.value =
            _.isBoolean(props.edit[field.id]) && props.edit[field.id] ?
              field.id : props.edit[field.id];
        }

        field.validation = fieldValidation(field);
        return field;
      })
      .value();
    this.setState(state);
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
          <FormField
            key={field.id}
            hasErrors={field.validation(field.value) ? 'error' : null}
            field={field}
            onChange={v => this.handleFieldChange(v, field)}
          />)
      );
    }
    return false;
  }

  render() {
    return (
      <Modal show={this.props.show} backdrop="static" dialogClassName="edit-upgrades-modal">
        <Modal.Header>
          <Modal.Title>{!_.isEmpty(this.props.edit) ? 'Edit Upgrade' : 'Add New Upgrade'}</Modal.Title>
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
              disabled={this.state.loading}
              onClick={() => this.props.onClose()}
            >Cancel</Button>
            <Button
              bsStyle="primary"
              disabled={this.state.loading || this.isFieldInvalid()}
              onClick={() => { this.onSave(); }}
            >Save Upgrade</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default cssModules(EditUpgradesModal, styles);

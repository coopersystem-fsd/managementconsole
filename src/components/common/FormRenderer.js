import React, { Component, PropTypes } from 'react';
import {
  Form,
  FormControl,
  FormGroup,
  ControlLabel,
  Row,
  Checkbox,
  Col,
} from 'react-bootstrap';
import DatePicker from 'react-datetime';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-select/dist/react-select.css';

import { getMultipleSelectValues, getTexasTime } from '../../helpers/common';

export const DATE = 'DATE';
export const DATE_TIME = 'DATETIME';
export const BOOLEAN = 'BOOLEAN';
export const ENUM = 'ENUM';
export const INTEGER = 'INTEGER';

export default class FormRenderer extends Component {
  /* eslint-disable */
  // Props Types
  static propTypes = {
    fields: PropTypes.array,
    onIsValidDate: PropTypes.func,
  }
  /* eslint-enable */

  // Default Props Value
  static defaultProps = {
    fields: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      allFields: props.fields || [],
      allFieldsError: {},
    };
  }

  onInputParamChange(ev, field) {
    const isInteger = field.parameterType === INTEGER;
    if (isInteger) {
      ev.target.value = ev.target.value.replace(/[^0-9]/, '');
    }
    this.onParamChange(ev, field);
  }

  onParamChange(value, field) {
    const allFields = this.state.allFields.map((r) => {
      const parameterType = r.parameterType;
      if (field.order === r.order) {
        if (parameterType === 'DATETIME' || parameterType === 'DATE') {
          r.value = getTexasTime(value).toISOString();
        } else if (parameterType === 'BOOLEAN') {
          r.value = value.target.checked;
        } else if (parameterType === 'ENUM') {
          if (field.multiselect) {
            const oldValues = (r.value && r.value.length) ? r.value.join(',') : '';
            r.value = getMultipleSelectValues(value.target.selectedOptions, oldValues).split(',');
          } else {
            r.value = value.target.value;
          }
        } else {
          r.value = value.target.value;
        }
      }
      return r;
    });
    this.setState({allFields});
  }

  getParamField(order) {
    const allFields = this.state.allFields.filter(r => order === r.order);
    return allFields.length ? allFields[0] : null;
  }

  componentWillReciveProps(props) {
    if (props.fields !== this.state.allFields) {
      this.setState({ allFields: props.fields });
    }
  }

  validateForm() {
    const allFields = this.state.allFields;
    const allFieldsError = { errorCount: 0 };

    _.forEach(allFields, ({required, value, id, parameterType}) => {
      if (required && (!value && !(parameterType === 'BOOLEAN' && value === false))) {
        allFieldsError[id] = '*';
        allFieldsError.errorCount += 1;
      }
    });

    this.setState({allFieldsError});
    return allFieldsError;
  }

  renderDateTime(field, hasError) {
    const onIsValidDate = this.props.onIsValidDate;
    const allFields = this.state.allFields;
    return (<FormGroup validationState={hasError && 'error'}>
      <Row key={field.id}>
        <Col xs={3}>
          <ControlLabel>{field.parameterLabel}</ControlLabel>
        </Col>
        <Col xs={4}>
          <DatePicker
            selected={field.value}
            isValidDate={date => onIsValidDate && onIsValidDate(field, date, allFields)}
            closeOnSelect
            dateFormat="YYYY-MM-DD"
            onChange={value => this.onParamChange(value, field)}
          />
        </Col>
      </Row>
    </FormGroup>);
  }

  renderBoolean(field, hasError) {
    if (typeof field.value === 'undefined') {
      field.value = false;
    }

    return (<FormGroup validationState={hasError && 'error'}>
      <Row key={field.id}>
        <Col xs={7}>
          <Checkbox
            checked={field.value}
            onChange={event => this.onParamChange(event, field)}
          >
            {field.parameterLabel}
          </Checkbox>
        </Col>
      </Row>
    </FormGroup>);
  }

  renderEnum(field, hasError, nameKey = 'title', valueKey = 'value') {
    const multiselect = field.multiselect;
    let defEnumValue = field.defaultValue;
    if (!defEnumValue && field.availableValues.indexOf(defEnumValue) === -1) {
      defEnumValue = field.availableValues[0];
      if (typeof defEnumValue === 'object') {
        defEnumValue = defEnumValue[valueKey];
      }
      if (multiselect) {
        defEnumValue = [defEnumValue];
      }
    }
    if (!field.value) {
      field.value = defEnumValue;
    }
    const options = field.availableValues.map((el) => {
      let value = el;
      let name = el;
      if (typeof el === 'object') {
        value = el[valueKey];
        name = el[nameKey];
      }
      return el === field.defaultValue ?
        <option selected value={value}>{name}</option> :
        <option value={value}>{name}</option>;
    });
    return (<FormGroup validationState={hasError && 'error'}>
      <Row key={field.id}>
        <Col xs={3}>
          <ControlLabel>{field.parameterLabel}</ControlLabel>
        </Col>
        <Col xs={4}>
          <FormControl
            multiple={multiselect}
            componentClass="select"
            placeholder={field.parameterLabel}
            selected={field.defaultValue}
            onChange={value =>
              this.onParamChange(
                value, field)}
          >{
            options
          }
          </FormControl>
        </Col>
      </Row>
    </FormGroup>);
  }

  renderGeneral(field, hasError) {
    return (<FormGroup validationState={hasError && 'error'}>
      <Row key={field.id}>
        <Col xs={3}>
          <ControlLabel>{field.parameterLabel}</ControlLabel>
        </Col>
        <Col xs={4}>
          <FormControl
            type="text" value={field.value}
            onChange={value => this.onInputParamChange(value, field)}
            placeholder={field.parameterLabel}
          />
        </Col>
      </Row>
    </FormGroup>);
  }

  renderField(field) {
    const hasError = this.state.allFieldsError[field.id];
    let component;
    switch (field.parameterType) {
      case DATE:
      case DATE_TIME:
        component = this.renderDateTime(field, hasError);
        break;
      case BOOLEAN:
        component = this.renderBoolean(field, hasError);
        break;
      case ENUM:
        component = this.renderEnum(field, hasError);
        break;
      default:
        component = this.renderGeneral(field, hasError);
    }

    return component;
  }

  render() {
    const fields = this.state.allFields;

    return (
      <Form className="form-generator">
        {fields.map(field => this.renderField(field))}
      </Form>
    );
  }

}

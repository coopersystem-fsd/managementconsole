import React, { Component, PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  Col,
  Checkbox,
  FormControl,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';

require('react-datepicker/dist/react-datepicker.css');

export default class FormField extends Component {
  /*eslint-disable */
  // Props Types
  static propTypes = {
    field: PropTypes.object.isRequired,
    hasErrors: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps ={
  };

  renderType(field) {
    const compProps = field.props || {};
    if (field.type === 'text') {
      return (
        <FormControl
          type="text"
          value={this.props.field.value}
          placeholder={field.placeholder ? field.placeholder : `Enter ${field.name}`}
          disabled={this.props.field.disabled}
          onChange={({target: {value}}) => this.props.onChange(value)}
        />
      );
    }

    if (field.type === 'number') {
      return (
        <FormControl
          type="number"
          value={this.props.field.value}
          placeholder={field.placeholder ? field.placeholder : `Enter ${field.name}`}
          disabled={this.props.field.disabled}
          onChange={({target: {value}}) => this.props.onChange(value)}
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <FormControl
          componentClass="textarea"
          rows="5"
          value={field.value}
          placeholder={field.placeholder ? field.placeholder : `Enter ${field.name}`}
          disabled={field.disabled}
          onChange={({target: {value}}) => this.props.onChange(value)}
        />
      );
    }

    if (field.type === 'checkbox') {
      return _.map(field.allValues, ({name, id}) => {
        const isChecked = field.value.indexOf(id) > -1;
        return (
          <Checkbox
            key={_.uniqueId()}
            disabled={this.props.field.disabled}
            checked={isChecked}
            onChange={() => this.props.onChange(_.xor(field.value, [id]))}
          >{name}</Checkbox>
        );
      });
    }

    if (field.type === 'date') {
      return (
        <FormGroup className="bottom0">
          {field.horizontal &&
            <Col xs={12}>
              <DatePicker
                className="form-control bottom0"
                disabled={this.props.field.disabled}
                dateFormat={field.dateFormat}
                showYearDropdown
                selected={field.value ? moment(field.value) : null}
                onChange={newDate => this.props.onChange(newDate)} {...compProps}
              />
            </Col>
          }
          {!field.horizontal &&
            <DatePicker
              className="form-control bottom0"
              disabled={this.props.field.disabled}
              dateFormat={field.dateFormat}
              showYearDropdown
              selected={field.value ? moment(field.value) : null}
              onChange={newDate => this.props.onChange(newDate)} {...compProps}
            />}
        </FormGroup>
      );
    }

    if (field.type === 'select') {
      return (
        <FormControl
          componentClass="select"
          disabled={this.props.field.disabled}
          value={field.value}
          onChange={({target: {value}}) => this.props.onChange(value)}
        >{_.map(field.allValues, value =>
          <option key={_.uniqueId()} value={value.id}>{value.name}</option>)}
        </FormControl>
      );
    }

    if (field.type === 'file') {
      return (
        <FormControl
          type="file"
          disabled={this.props.field.disabled}
          className="form-control"
          onChange={(e) => {
            e.preventDefault();
            const file = [...e.target.files][0];
            this.props.onChange(file);
          }}
        />
      );
    }

    return false;
  }

  render() {
    const fieldExists =
      [
        'text',
        'number',
        'textarea',
        'date',
        'checkbox',
        'select',
        'file',
      ].indexOf(this.props.field.type) > -1;

    if (fieldExists) {
      return (
        <FormGroup
          className={`clearfix ${this.props.field.className ? this.props.field.className : ''}`}
          order={this.props.field.order}
          controlId={this.props.field.id}
          validationState={this.props.hasErrors}
        >
          {this.props.field.horizontal && this.props.field.name &&
            <Col componentClass={ControlLabel} sm={this.props.field.labelSm || 2}>
              {this.props.field.name}
            </Col>}

          {!this.props.field.horizontal && this.props.field.name &&
            <Col sm={12}><ControlLabel>{this.props.field.name}</ControlLabel></Col>}

          <Col sm={this.props.field.horizontal ? this.props.field.fieldSm || 10 : 12}>
            {this.renderType(this.props.field)}
          </Col>
        </FormGroup>
      );
    }

    return false;
  }

}

import React, { Component, PropTypes } from 'react';
import { FormControl, Col, ControlLabel } from 'react-bootstrap';
import _ from 'lodash';

export default class SelectFilter extends Component {

  // Props Types
  static propTypes = {
    style: PropTypes.object,
    title: PropTypes.string,
    valueField: PropTypes.string,
    nameField: PropTypes.string,
    sm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    smOffset: PropTypes.number,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    vertical: PropTypes.bool,
    pureValue: PropTypes.bool,
    labelSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inputSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  // Default Props Value
  static defaultProps ={
    title: '',
    className: '',
    valueField: 'value',
    nameField: 'name',
    multiple: false,
    vertical: true,
    pureValue: false,
    labelSize: 2,
    inputSize: 10,
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(ev) {
    const allOptions = this.props.options;
    this.props.onChange(ev, allOptions);
  }

  getByPureValue(value) {
    if (typeof value === 'undefined') {
      return value;
    }

    const obj = {
      [this.props.valueField]: value,
    };
    const pureValue = _.find(this.props.options, obj);
    return pureValue;
  }

  renderVertical(xs, sm, smOffset, value, defaultValue) {
    return (
      <Col
        sm={sm}
        className={this.props.className}
        smOffset={smOffset}
        style={this.props.style}
        xs={xs}
      >
        <ControlLabel>{this.props.title}</ControlLabel>
        <FormControl
          multiple={this.props.multiple}
          componentClass="select"
          value={value}
          defaultValue={defaultValue}
          onChange={this.onChange}
        >{this.renderOptions()}</FormControl>
      </Col>
    );
  }

  renderHorizontal(xs, sm, smOffset, value, defaultValue) {
    let {inputSize, labelSize} = this.props;
    inputSize = parseInt(inputSize, 10);
    labelSize = parseInt(labelSize, 10);
    return (
      <Col
        sm={sm}
        className={this.props.className}
        smOffset={smOffset}
        style={this.props.style}
        xs={xs}
      >
        <Col componentClass={ControlLabel} sm={labelSize} style={{textAlign: 'right', paddingTop: 7}}>
          {this.props.title}
        </Col>
        <Col sm={inputSize}>
          <FormControl
            multiple={this.props.multiple}
            componentClass="select"
            value={value}
            defaultValue={defaultValue}
            onChange={this.props.onChange}
          >{
            this.renderOptions()
          }</FormControl>
        </Col>
      </Col>
    );
  }

  renderOptions() {
    const options = this.props.options;
    const renderOptions = this.props.showAll ? [<option key={_.uniqueId()} value={'*'}>All</option>] : [];
    options.forEach((opt) => {
      renderOptions.push(
        <option key={_.uniqueId()} value={opt[this.props.valueField]}>
          {opt[this.props.nameField]}
        </option>
      );
    });
    return renderOptions;
  }

  render() {
    const sm = this.props.sm ? parseInt(this.props.sm, 10) : undefined;
    const xs = this.props.xs ? parseInt(this.props.xs, 10) : undefined;
    const smOffset = this.props.smOffset ? parseInt(this.props.smOffset, 10) : undefined;
    const value = this.props.pureValue ? this.getByPureValue(this.props.value) : this.props.value;
    const defaultValue =
      this.props.pureValue ?
        this.getByPureValue(this.props.defaultValue) :
        this.props.defaultValue;

    if (this.props.vertical) {
      return this.renderVertical(xs, sm, smOffset, value, defaultValue);
    }
    return this.renderHorizontal(xs, sm, smOffset, value, defaultValue);
  }
}

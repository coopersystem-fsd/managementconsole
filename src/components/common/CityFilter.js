import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import SelectFilter from './SelectFilter';

/**
 * This class are something middle between container and component.
 * It is well known practice to use them as component
 */
class CityFilter extends Component {
  /*eslint-disable */
  //Props Types
  static propTypes = {
    style: PropTypes.object,
    cities: PropTypes.array,
    title: PropTypes.string,
    multiple: PropTypes.bool,
    className: PropTypes.string,
    sm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    xs: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    smOffset: PropTypes.number,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    showAll: PropTypes.bool,
    vertical: PropTypes.bool,
    pureValue: PropTypes.bool,
    labelSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inputSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  //Default Props Value
  static defaultProps = {
    sm: 2,
    title : "City",
    className: "",
    valueField: "id",
    multiple: false,
    defaultValue: "*",
    showAll: true,
    vertical: true,
    pureValue: false,
  };
  /*eslint-enable */

  render() {
    const sm = this.props.sm;
    const smOffset = this.props.smOffset;
    return (
      <SelectFilter
        title={this.props.title}
        valueField="id"
        nameField="name"
        multiple={this.props.multiple}
        vertical={this.props.vertical}
        sm={_.toNumber(sm)}
        className={this.props.className}
        smOffset={smOffset}
        options={this.props.cities || []}
        style={this.props.style}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}
        pureValue={this.props.pureValue}
        xs={this.props.xs}
        inputSize={this.props.inputSize}
        labelSize={this.props.labelSize}
      />
    );
  }

}

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  cities: state.common.cities,
});

const Container = CityFilter;

export default connect(
  mapStateToProps,
)(Container);

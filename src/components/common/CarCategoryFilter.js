import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import SelectFilter from './SelectFilter';

/**
 * This class are something middle between container and component.
 * It is well known practice to use them as component
 */
class CarCategoryFilter extends Component {
  /*eslint-disable */
  // Props Types
  static propTypes = {
    style: PropTypes.object,
    cities: PropTypes.array,
    title: PropTypes.string,
    multiple: PropTypes.bool,
    className: PropTypes.string,
    sm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    smOffset: PropTypes.number,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    showAll: PropTypes.bool,
    vertical: PropTypes.bool,
    pureValue: PropTypes.bool,
    labelSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inputSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  // Default Props Value
  static defaultProps = {
    sm: 2,
    title : "Car Category",
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
        valueField="carCategory"
        nameField="title"
        multiple={this.props.multiple}
        vertical={this.props.vertical}
        sm={sm}
        className={this.props.className}
        smOffset={smOffset}
        options={this.props.categories ? this.props.categories.allItems : []}
        style={this.props.style}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}
        showAll={this.props.showAll}
        pureValue={this.props.pureValue}
        inputSize={this.props.inputSize}
        labelSize={this.props.labelSize}
      />
    );
  }

}

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  categories: state.common.carTypesMap,
});

const Container = CarCategoryFilter;

export default connect(
  mapStateToProps
)(Container);

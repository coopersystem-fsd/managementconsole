import React, { Component } from 'react'; // eslint-disable-line
import { connect } from 'react-redux';

class PropsWatcher extends Component {

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  setData(nextProps) {
    const props = nextProps || this.props;

    if (isNaN(this.props.value) && isNaN(nextProps.value)) {
      return;
    }
    if (this.props.value !== nextProps.value) {
      this.props.handler(props.value, this.props.value);
    }
  }

  render() {
    return null;
  }
}

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = (state, props) =>
  ({
    value: _.get(state, props.prop),
  });


const Container = connect(
  mapStateToProps,
)(PropsWatcher);

export default Container;

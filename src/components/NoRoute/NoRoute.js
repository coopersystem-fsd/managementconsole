import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';

class NoRoute extends Component {
  componentDidMount() {
    setTimeout(() => { browserHistory.push('/'); }, 2000);
  }

  render() {
    return <Col xs={12}>Wrong link, or no route yet</Col>;
  }
}

const mapStateToProps = state => ({
  login: state.login,
});

export default connect(
  mapStateToProps,
)(NoRoute);

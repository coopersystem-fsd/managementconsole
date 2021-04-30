import React, { Component } from 'react';
import { connect } from 'react-redux';
import {browserHistory} from 'react-router';
import {getUser} from '../modules/login-module';

function Enhance(ComposedComponent) {
  class Auth extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    componentDidMount() {
      this.setData();
    }

    componentWillReceiveProps(nextProps) {
      this.setData(nextProps);
    }

    setData(nextProps) {
      const props = nextProps || this.props;
      const isLogged = props.isLogged;
      const token = props.token;
      if (!isLogged && token) {
        this.props.getUser()
          .then(() => this.setState({isReady: true}))
          .catch(() => {
            browserHistory.push('/login');
          });
      } else if (isLogged) {
        this.setState({isReady: true});
      } else {
        browserHistory.push('/login');
      }
    }

    render() {
      if (this.state.isReady) return <ComposedComponent {...this.props} />;
      return false;
    }
  }

  const mapStateToProps = state =>
    ({
      isLogged: state.login.isLogged,
      token: state.common.token,
    });

  // mapDispatchToProps :: Dispatch -> {Action}
  const mapDispatchToProps = dispatch => ({
    getUser: token => dispatch(getUser(token)),
    dispatch,
  });

  return connect(mapStateToProps, mapDispatchToProps)(Auth);
}

export default Enhance;

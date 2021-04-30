import React, { Component, PropTypes } from 'react';
import {
  FormGroup,
  Panel,
  Col,
  Button,
  Form,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';
import { isEmail } from 'validator';
import {Notifications} from '../';
import './Login.scss';

class Login extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    username: PropTypes.string, // eslint-disable-line
    password: PropTypes.string, // eslint-disable-line
  }

  // Default Props Value
  static defaultProps = {
    username: '',
    password: '',
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.syncPropsWithState(props, false);
    this.submitAuth = this.submitAuth.bind(this);
  }

  getValidationClassForEmail() {
    return isEmail(this.state.username) ? 'success' : 'error';
  }

  getValidationClassForPassword() {
    return this.state.password.length ? 'success' : 'error';
  }

  syncPropsWithState(nextProps, mounted = true) {
    const newState = {
      username: nextProps.username,
    };
    if ('password' in nextProps) {
      newState.password = nextProps.password;
    }
    if (mounted) {
      this.setState(newState);
    } else {
      this.state = { ...this.state, ...newState };
    }
  }

  isValidForSubmit() {
    return isEmail(this.state.username) && this.state.password;
  }

  submitAuth(e) {
    e.preventDefault();

    if (!this.isValidForSubmit()) {
      return;
    }

    const user = {
      username: this.state.username,
      password: this.state.password,
    };

    this.props.actions.login(user);
  }

  render() {
    return (
      <div>
        <Col xs={12} sm={6} smOffset={3}>
          <Notifications />
          <Panel className="login-form" header="RideAustin">
            <Form horizontal>
              <FormGroup
                controlId="formHorizontalEmail"
                validationState={this.getValidationClassForEmail()}
              >
                <Col componentClass={ControlLabel} sm={2}>
                  Username{' '}
                </Col>
                <Col sm={10}>
                  <FormControl
                    required
                    type="text"
                    placeholder="Email"
                    value={this.state.username}
                    onChange={e => this.setState({username: e.target.value})}
                  />
                </Col>
              </FormGroup>
              <FormGroup
                controlId="formHorizontalPassword"
                validationState={this.getValidationClassForPassword()}
              >
                <Col componentClass={ControlLabel} sm={2}>
                  Password{' '}
                </Col>
                <Col sm={10}>
                  <FormControl
                    required
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={e => this.setState({password: e.target.value})}
                  />
                </Col>
              </FormGroup>
              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Button
                    className={this.props.logging ? 'disabled' : ''}
                    type="submit"
                    onClick={this.submitAuth}
                  ><div>{this.props.logging ? 'Loading...' : 'Sign in'}</div>
                  </Button>
                  <Button
                    bsStyle="link"
                    type="button"
                    onClick={this.props.handleForgotPasswordClick}
                  >Forgot password
                  </Button>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </Col>
      </div>
    );
  }
}

export default Login;

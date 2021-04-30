import React, { Component, PropTypes } from 'react';
import { isEmail } from 'validator';

import {
  FormGroup,
  Panel,
  Col,
  Button,
  Form,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import {Notifications} from '../';
import styles from './ForgetPassword.scss';

class ForgetPassword extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    username: PropTypes.string,
  }

  // Default Props Value
  static defaultProps = {
    username: '',
  };

  constructor(props) {
    super(props);

    const newState = {
      username: props.username,
    };
    this.state = newState;

    this.handleForgotPasswordSendClick = this.handleForgotPasswordSendClick.bind(this);
  }

  getValidationClassForEmail() {
    return isEmail(this.state.username) ? 'success' : 'error';
  }

  handleForgotPasswordSendClick(e) {
    e.preventDefault();
    if (!this.state.username || !isEmail(this.state.username)) {
      return;
    }

    this.props.actions.forgotPassword({ email: this.state.username });
  }

  render() {
    return (
      <div className={styles.forgetPassword}>
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
              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Button
                    type="submit"
                    onClick={this.handleForgotPasswordSendClick}
                  >Forgot password
                  </Button>
                  <Button
                    bsStyle="link"
                    type="button"
                    onClick={this.props.handleSignInClick}
                  >Sign in
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

export default cssModules(ForgetPassword, styles);

import React, { Component } from 'react';
import { Col, Row, Well, ButtonToolbar, Button } from 'react-bootstrap';
import cssModules from 'react-css-modules';
import { browserHistory } from 'react-router';
import styles from './Profile.scss';
import PropsWatcher from '../../containers/PropsWatcher';
import RideHistoryContainer from '../../containers/RideHistoryContainer';
import UserPicture from '../User/UserPicture';
import Box from '../common/Box';
import LegalIdentifiers from './LegalIdentifiers';
import LicenseInfo from './LicenseInfo';
import PayoneerInfo from './PayoneerInfo';
import Cars from './Cars';
import DriversImportContainer from '../../containers/DriversImportContainer';

class Profile extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleLoad();
  }

  componentWillUnmount() {
    this.props.actions.cleanup();
  }

  handleLoad() {
    this.props.actions.getUser(this.props.params);
  }

  renderDashboard() {
    if (this.props.params.userType === 'drivers') {
      let style = 'default';
      switch (this.props.profile.user.onlineStatus) {
        case 'ONLINE':
          style = 'success';
          break;
        case 'RIDING':
          style = 'info';
          break;
        case 'STUCK':
          style = 'warning';
          break;
        default:
          style = 'default';
      }
      return (
        <Well bsSize="sm" className="clearfix">
          <ButtonToolbar className="pull-left">
            <Button
              disabled={_.isEmpty(this.props.profile.user)}
              onClick={() => browserHistory.push(`/profile/drivers/${this.props.profile.user.id}/payments`)}
            >Custom Payments</Button>
          </ButtonToolbar>
          <ButtonToolbar className="pull-right">
            <Button
              onClick={() => this.setState({showUploadDriverDataModal: true})}
            >Upload CSV</Button>
            <Button
              onClick={() => {
                this.setState({activationEmailSending: true});
                this.props.actions.sendActivationEmail(this.props.profile.user.id)
                  .then(() => this.setState({activationEmailSending: false}));
              }}
              disabled={_.isEmpty(this.props.profile.user) || this.state.activationEmailSending}
            >{this.state.activationEmailSending ? 'Sending...' : 'Resend Activation Email'}</Button>
            <Button
              bsStyle={style}
              onClick={() => this.props.actions.release(this.props.profile.user.id,
                this.props.profile.user.onlineStatus)}
            >{this.props.profile.user.onlineStatus}</Button>
            <Button
              disabled={_.isEmpty(this.props.profile.user)}
              onClick={() => browserHistory.push(`/${this.props.params.userType}/edit/${this.props.profile.user.id}`)}
            >Edit</Button>
          </ButtonToolbar>
        </Well>
      );
    }
    return (
      <Well bsSize="sm" className="clearfix">
        <ButtonToolbar className="pull-right">
          <Button
            disabled={_.isEmpty(this.props.profile.user)}
            onClick={() => browserHistory.push(`/${this.props.params.userType}/edit/${this.props.profile.user.id}`)}
          >Edit</Button>
          <Button
            disabled={_.isEmpty(this.props.profile.user)}
            onClick={() => {
              this.props.actions.unlockRider(this.props.profile.user.id);
            }}
          >Unlock cards</Button>
          <Button
            disabled={_.isEmpty(this.props.profile.user)}
            onClick={() => {
              this.props.actions.resetEmail(this.props.profile.user.email);
            }}
          >Reset password</Button>
        </ButtonToolbar>
      </Well>
    );
  }

  renderUserPicture() {
    return (
      <Col sm={2}>
        <UserPicture
          user={this.props.profile.user}
          viewOnly
          showName
        />
      </Col>
    );
  }

  renderLegalIdentifiers() {
    if (this.props.params.userType === 'drivers') {
      return (
        <Col sm={2}>
          <Box title="Legal Identifiers">
            <LegalIdentifiers
              {..._.last(this.props.profile.user.checkrReports)}
              loading={this.props.profile.loading}
            />
          </Box>
        </Col>
      );
    }
    return false;
  }

  renderLicenseInfo() {
    if (this.props.params.userType === 'drivers') {
      return (
        <Col sm={2}>
          <Box title="License Info">
            <LicenseInfo user={this.props.profile.user} loading={this.props.profile.loading} />
          </Box>
          <Box title="PayoneerInfo">
            <PayoneerInfo user={this.props.profile.user} loading={this.props.profile.loading} />
          </Box>
        </Col>
      );
    }
    return false;
  }

  renderCars() {
    if (this.props.params.userType === 'drivers' && this.props.profile.selectedCar) {
      return (
        <Col sm={6}>
          <Box title="Cars">
            <Cars
              loading={this.props.profile.loading}
              onSelectCar={car =>
                this.props.actions.selectCar({
                  car,
                  user: this.props.profile.user,
                  carDocuments: this.props.profile.carDocuments,
                })
              }
              onSave={car => this.props.actions.updateCar(car)}
              selectedCar={this.props.profile.selectedCar}
              user={this.props.profile.user}
              carDocuments={this.props.profile.carDocuments[this.props.profile.selectedCar.id]}
            />
          </Box>
        </Col>
      );
    }
    return false;
  }

  render() {
    return (
      <div className="profile clearfix row">
        <PropsWatcher prop="common.selectedCity" handler={cityId => this.setState({cityId}, this.handleLoad)} />
        <Row>
          <Col sm={12}>
            {this.renderDashboard()}
          </Col>
        </Row>
        <Row>
          {this.renderUserPicture()}
          {this.renderLegalIdentifiers()}
          {this.renderLicenseInfo()}
          {this.renderCars()}
        </Row>
        <Row>
          <Col sm={12}>
            <RideHistoryContainer params={this.props.params} mapWidth="150px" />
          </Col>
        </Row>
        <DriversImportContainer
          openModal={this.state.showUploadDriverDataModal}
          onClose={() => { this.setState({ showUploadDriverDataModal: false }); }}
        />
      </div>
    );
  }
}

export default cssModules(Profile, styles);

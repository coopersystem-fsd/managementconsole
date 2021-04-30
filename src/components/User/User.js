import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import {
  Col,
  Tabs,
  Tab,
  Row,
} from 'react-bootstrap';
import styles from './User.scss';
import constants from '../../data/constants';
import Profile from './Profile';
import UserPicture from './UserPicture';
import UserHistory from './UserHistory';
import ActivationStatus from './ActivationStatus';
import OnboardingStatus from './OnboardingStatus';
import EmailFollowUp from './EmailFollowUp';
import Cars from './Cars';
import Background from './Background';
import Finance from './Finance';
import Ratings from '../../containers/RatingsContainer';
import Loading from '../Loading';
import LostItems from './LostItems';
import Campaigns from './Campaigns';

require('react-datepicker/dist/react-datepicker.css');

class User extends Component { // eslint-disable-line react/prefer-stateless-function
  // Props Types
  static propTypes = {
  }

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      activeTab: 'profile',
      user: {},
    };
  }

  componentDidMount() {
    this.onInit();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  componentWillUnmount() {
    this.props.actions.clearDriverOnboarding();
    if (!this.props.keepTabState) this.props.actions.setActiveTab(null);
  }

  onInit() {
    const {query} = this.props.location || {query: {}};
    const tab = this.props.user.activeTab || query.tab;
    const activeTab = constants.user.tabs.indexOf(tab) > -1 ? tab : 'profile';
    this.setState({activeTab}, this.handleLoad);
  }

  onUserChange() {
    if (this.props.onUserChange) {
      this.props.onUserChange();
      if (this.userHistory) {
        this.userHistory.loadUserHistory();
      }
    }
  }

  onChangeDocumentStatus(id, status) {
    this.props.actions.updateDocumentStatus({id, status});
  }

  onChangeDocument(newDocument) {
    newDocument.cityId = this.props.common.selectedCity;
    this.props.actions.updateDriverDocument({
      documents: this.props.user.documents,
      newDocument,
      carDocuments: this.props.user.carDocuments,
    })
    .then(({payload: {error, documents, carDocuments}}) => {
      const state = {};
      if (this.onUserChange) this.onUserChange();
      if (documents) {
        state.documents =
        _.chain(documents)
          .map((doc) => {
            if (doc.documentType === newDocument.driverPhotoType) {
              doc.complete = true;
            }
            return doc;
          })
          .value();
      }
      if (carDocuments) {
        state.carDocuments = _.chain(carDocuments)
          .map((car) => {
            if (car.carId === newDocument.carId) {
              car.carDocuments = _.map(car.carDocuments, (doc) => {
                if (doc.documentType === newDocument.driverPhotoType) {
                  doc.complete = true;
                }
                return doc;
              });
            }
            return car;
          })
          .value();
      }
      if (!error) this.setState(state);
    });
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {loading} = props;
    if (loading) {
      this.setState({user: {}});
    }
  }

  isDriver() {
    return _.get(this.state, 'user.type') === 'DRIVER';
  }

  isRider() {
    return _.get(this.state, 'user.type') === 'RIDER';
  }

  handleLoad() {
    if (this.props.params.type === 'riders') {
      this.props.actions.getRider(this.props.params)
        .then(({payload: {data: user, lostItems}}) => {
          this.setState({user, lostItems});
        });
      this.props.actions.getCampaigns(this.props.params.userID)
        .then((data) => {
          this.setState({campaigns: data.payload});
        });
    }
    if (this.props.params.type === 'drivers') {
      this.props.actions.getDriver(this.props.params)
        .then(({payload: {data: user, documents, lostItems}}) => {
          this.setState({user, documents, lostItems});
        });
    }
  }


  renderProfile() {
    if (this.state.user && this.state.activeTab === 'profile') {
      return (
        <Profile
          updating={this.props.user.profileUpdating}
          ref={(ref) => { this.profile = ref; }}
          user={this.state.user}
          documents={this.state.documents}
          onChange={(user) => {
            if (this.isDriver()) {
              return this.props.actions.updateDriver(user)
                .then(({payload: {data, error}}) => {
                  if (!error) this.setState({user: data});
                  if (this.onUserChange) this.onUserChange();
                });
            }
            if (this.state.user.type === 'RIDER') {
              return this.props.actions.updateRider(user)
                .then(({payload: {data, error}}) => {
                  if (!error) this.setState({user: data});
                });
            }
            return false;
          }}
          onChangeDocument={newDocument => this.onChangeDocument(newDocument)}
          onChangeDocumentStatus={(id, status) => this.onChangeDocumentStatus(id, status)}
        />
      );
    }
    return false;
  }

  renderCars() {
    if (this.state.activeTab === 'carAndInsurance' && this.state.user) {
      return (
        <Cars
          carTypes={this.props.common.carTypesMap}
          carDocuments={this.state.carDocuments}
          user={this.state.user}
          ref={(ref) => { this.cars = ref; }}
          onChangeDocument={newDocument =>
            this.onChangeDocument(newDocument)}
          onCarSelect={(carId) => {
            this.props.actions.getCarDocuments({
              carId,
              id: this.state.user.id,
              carDocuments: this.props.user.carDocuments,
            })
            .then(({payload: {error, carDocuments}}) => {
              if (!error) this.setState({carDocuments});
            });
          }}
          onSaveCar={(car) => {
            this.props.actions.updateCar(car, this.props.user.data)
              .then(({payload: {error, data}}) => {
                if (!error) this.setState({user: data});
                if (this.onUserChange) this.onUserChange();
              });
          }}
          onDeleteCar={(car) => {
            this.props.actions.deleteCar(car, this.props.user.data)
              .then(({payload: {error, data}}) => {
                if (!error) this.setState({user: data});
                if (this.onUserChange) this.onUserChange();
              });
          }}
          onAddCar={(newCar) => {
            newCar.cityId = this.props.common.selectedCity;
            newCar.driverId = this.state.user.id;
            this.props.actions.createCar(newCar, this.props.user.data)
              .then(({payload: {error, data}}) => {
                if (!error) this.setState({user: data});
                if (this.onUserChange) this.onUserChange();
              });
          }}
        />
      );
    }
    return false;
  }

  renderBackground() {
    if (this.state.user && this.state.activeTab === 'backgroundAndCityChecks') {
      return (
        <Background
          onChange={() => {
            if (this.props.onUserChange) this.props.onUserChange();
            this.handleLoad();
          }}
          user={this.props.user.data}
          updateCheckrReport={id => this.props.actions.updateCheckr(id, this.props.user.data)}
          onCheckrRequest={params =>
            this.props.actions.createCheckr(params, this.props.user.data)
              .then(({payload: {data, error}}) => {
                if (!error) this.setState({user: data});
                if (this.onUserChange) this.onUserChange();
                return {data, error};
              })
          }
          onCheckrNotesChange={user =>
            this.props.actions.updateDriver(user)
              .then(({payload: {data, error}}) => {
                if (!error) this.setState({user: data});
              })
          }
        />
      );
    }
    return false;
  }

  renderFinance() {
    if (this.state.user && this.state.activeTab === 'financeAndLegal') {
      return (
        <Finance user={this.state.user} />
      );
    }
    return false;
  }

  renderRatings() {
    if (this.state.user && this.state.activeTab === 'ratings') {
      return (
        <Ratings user={this.state.user} />
      );
    }
    return false;
  }

  renderUserHistory() {
    if (this.state.user && this.state.activeTab === 'userHistory') {
      return (
        <UserHistory
          ref={(ref) => { this.userHistory = ref; }}
          user={this.state.user}
          emailHistory={this.props.user.emailHistory}
          getEmail={this.props.actions.getSentEmailTemplate}
        />
      );
    }
    return false;
  }

  renderLostItems() {
    if (this.state.user && this.state.activeTab === 'lostItems') {
      return (
        <LostItems
          user={this.state.user} lostItems={this.state.lostItems}
        />
      );
    }
    return false;
  }

  renderCampaigns() {
    if (this.state.user && this.state.activeTab === 'campaigns') {
      return (
        <Campaigns
          user={this.state.user} campaigns={this.state.campaigns} actions={this.props.actions}
        />
      );
    }
    return false;
  }

  renderTabs() {
    if (_.isEmpty(this.state.user)) return <Loading loading height="300" />;
    return (
      <Tabs
        activeKey={this.state.activeTab}
        onSelect={(activeTab) => {
          this.setState({activeTab});
          this.props.actions.setActiveTab(activeTab);
        }}
        id="user-tabs"
      >
        <Tab eventKey={'profile'} title="Profile">
          <div className="user-tab-content clearfix">{this.renderProfile()}</div>
        </Tab>
        {this.isDriver() &&
          <Tab eventKey={'carAndInsurance'} title="Car & Insurance">
            <div className="user-tab-content clearfix">{this.renderCars()}</div>
          </Tab>
        }
        {this.isDriver() &&
          <Tab eventKey={'backgroundAndCityChecks'} title="Background & City Checks">
            <div className="user-tab-content clearfix">{this.renderBackground()}</div>
          </Tab>
        }
        {this.isDriver() &&
          <Tab eventKey={'financeAndLegal'} title="Finance & Legal">
            <div className="user-tab-content clearfix">{this.renderFinance()}</div>
          </Tab>
        }
        <Tab eventKey={'ratings'} title="Ratings">
          {this.isDriver() &&
            <div className="user-tab-content clearfix">{this.renderRatings()}</div>
          }
          {
            !this.isDriver() && <div className="user-tab-content clearfix">{this.renderRatings()}</div>}
        </Tab>
        {this.isDriver() &&
          <Tab eventKey={'userHistory'} title="User History">
            <div className="user-tab-content clearfix">{this.renderUserHistory()}</div>
          </Tab>
        }
        <Tab eventKey={'lostItems'} title="Lost Items">
          <div className="user-tab-content clearfix">{this.renderLostItems()}</div>
        </Tab>
        {this.isRider() &&
          <Tab eventKey={'campaigns'} title="Campaigns">
            <div className="user-tab-content clearfix">{this.renderCampaigns()}</div>
          </Tab>
        }
      </Tabs>
    );
  }

  renderUserPicture() {
    return (
      <UserPicture
        showName
        bsStyle="link"
        user={this.state.user}
        onChangeDocument={newDocument => this.onChangeDocument(newDocument)}
        documents={this.state.documents}
      />
    );
  }

  renderActivationStatus() {
    return (
      <ActivationStatus
        user={this.state.user}
        onChange={(user) => {
          if (this.onUserChange) this.onUserChange();
          if (this.isDriver()) {
            return this.props.actions.updateDriver(user)
              .then(({payload: {data, error}}) => {
                if (!error) this.setState({user: data});
                if (this.userHistory) {
                  this.userHistory.loadUserHistory();
                }
              });
          }
          if (this.state.user.type === 'RIDER') {
            return this.props.actions.updateRider(user)
              .then(({payload: {data, error}}) => {
                if (!error) this.setState({user: data});
              });
          }
          return false;
        }}
      />
    );
  }

  renderOnboardingStatus() {
    if (this.state.user && this.isDriver()) {
      return <OnboardingStatus onboarding={this.props.user.onboarding} />;
    }
    return <Loading loading height="185" />;
  }
  renderEmailFollowUp() {
    if (this.state.user && this.props.common.emailReminders && this.isDriver()) {
      return (
        <EmailFollowUp
          city={_.find(this.props.common.cities.slice(), {id: this.props.common.selectedCity})}
          user={this.state.user}
          emailReminders={this.props.common.emailReminders
            .filter((reminder) => {
              if (reminder.cityId) {
                return reminder.cityId === this.state.user.cityId;
              }
              return true;
            })
          }
          emailHistory={this.props.user.emailHistory}
          onSend={params => this.props.actions.sendEmail(params)}
          getEmailTemplate={id => this.props.actions.getEmailTemplate(id)}
        />
      );
    }
    return <Loading loading height="185" />;
  }

  render() {
    return (
      <div className="user">
        <Row>
          <Col md={2} className="top-box">{this.renderUserPicture()}</Col>
          <Col md={this.isRider() ? 2 : 4} className="top-box">{this.renderActivationStatus()}</Col>
          {this.isDriver() && <Col md={3} className="top-box">{this.renderOnboardingStatus()}</Col>}
          {this.isDriver() && <Col md={3} className="top-box">{this.renderEmailFollowUp()}</Col>}
        </Row>
        <Row>
          <Col sm={12}>{this.renderTabs()}</Col>
        </Row>
      </div>
    );
  }
}

export default cssModules(User, styles);

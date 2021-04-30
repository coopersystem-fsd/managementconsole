import React, { Component, PropTypes } from 'react';
import {
  ListGroupItem,
  ListGroup,
} from 'react-bootstrap';
import Loading from '../Loading';

require('react-datepicker/dist/react-datepicker.css');

class OnboardingStatus extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    onboarding: PropTypes.array,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {onboarding} = props;

    this.setState({
      onboarding,
    });
  }

  getOnboardingStatus() {
    if (this.state.onboarding) {
      return _.find(this.state.onboarding, {id: 'onboardingStatus'}).value.name;
    }
    return false;
  }

  renderOnboardingStatus() {
    if (this.state.onboarding) {
      return (
        <ul className="status-list">
          {
            _.map(this.state.onboarding, (status) => {
              if (!_.isArray(status)) {
                return (
                  <li key={_.uniqueId()}>{_.get(status, 'name')}: {_.get(status, 'value.name')}</li>
                );
              } else if (status.id === 'onboardingStatus') {
                return false;
              }

              return _.map(status, ({car, statuses}) =>
                (<li>
                  {car.make} {car.model}
                  <ul>
                    {_.map(statuses, (carStatus) => {
                      if (carStatus.id === 'carPhotosStatus') {
                        return (
                          <li key={_.uniqueId()}>
                            {carStatus.name}: {carStatus.value.name}
                            <ul>
                              {_.map(carStatus.value, photo =>
                                <li key={_.uniqueId()}>{photo.type}: {photo.name}</li>)}
                            </ul>
                          </li>
                        );
                      }
                      return <li key={_.uniqueId()}>{_.get(carStatus, 'name')}: {_.get(carStatus, 'value.name')}</li>;
                    })}
                  </ul>
                </li>)
              );
            })
          }
        </ul>
      );
    }
    return false;
  }

  render() {
    return (
      <div className="user-onboarding-status">
        <ListGroup>
          <ListGroupItem>
            <strong>
              <small>
                Onboarding Status {this.props.onboarding &&
                  <span>-</span>
                } {this.getOnboardingStatus()}
              </small>
            </strong>
            {this.renderOnboardingStatus()}
            {!this.props.onboarding && <Loading loading height="185" />}
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}

export default OnboardingStatus;

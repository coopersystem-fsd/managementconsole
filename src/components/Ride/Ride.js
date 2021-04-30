import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import {
  Image,
  Row,
  Col,
  Button,
  Tooltip,
  OverlayTrigger,
  Label,
} from 'react-bootstrap';
import _ from 'lodash';
import GoogleMap from 'google-map-react';

import Loading from '../Loading';
import keys from '../../services';
import constants from '../../data/constants';
import {ConfirmModal} from '../';
import {getTexasTime} from '../../helpers/common';

export default class Ride extends Component {
  constructor(props) {
    super(props);
    this.state = {
      farePayments: null,
    };
  }

  componentDidMount() {
    this.props.actions.getRide(this.props.params.rideID);
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  getItemValue(item) {
    let value =
      item.method ?
        this[item.method](this.props.ride.ride) :
        _.get(this.props.ride.ride, item.path || item.id);

    if (item.type === 'date' && value) value = getTexasTime(moment(value), false).format('MMM DD, YYYY, h:mm a');
    if (item.type === 'amount') value = `$${value || 0}`;
    if (item.type === 'distance') value = value ? `${value} Miles` : null;
    if (item.negativeValue) value = value !== '$0' ? `-${value}` : `${value}`;

    return value || 'Unavailable';
  }

  getNumValue(num) {
    return _.isNaN(_.toNumber(num)) ? 0 : _.toNumber(num);
  }

  calculateTotalTime(rideData) {
    if (!rideData.driverReachedOn || !rideData.completedOn) return 'Unavailable';

    const start = moment(rideData.startedOn);
    const completed = moment(rideData.completedOn);

    let totalTime = completed.diff(start, 'minutes', true).toString();

    totalTime = `${_.round(totalTime, 0)} min`;

    return totalTime;
  }

  renderCarTypeTooltip({requestedCarType}) {
    if (requestedCarType) {
      const tooltip = (
        <Tooltip id="tooltip">
          <strong>Minimum Fare: $</strong>{requestedCarType.minimumFare} <br />
          <strong>Rate Per Mile: $</strong>{requestedCarType.ratePerMile} <br />
          <strong>Rate Per Min: $</strong>{requestedCarType.ratePerMinute} <br />
        </Tooltip>
      );
      return (
        <OverlayTrigger placement="left" overlay={tooltip}>
          <Label bsStyle="default">{requestedCarType.carCategory}</Label>
        </OverlayTrigger>
      );
    }
    return false;
  }

  renderCancelRideBtn() {
    if (this.props.ride.ride.status && (
      this.props.ride.ride.status === 'COMPLETED' ||
      this.props.ride.ride.status.indexOf('CANCELLED') !== -1 ||
      this.props.ride.ride.status === 'NO_AVAILABLE_DRIVER')) {
      return false;
    }

    return (
      <div className="top10">
        <Button onClick={() => this.setState({showCancel: true})} bsStyle={'danger'}>
          Cancel ride
        </Button>
      </div>
    );
  }

  renderResendReceiptBtn() {
    if (this.props.ride.ride.status && (
      this.props.ride.ride.status === 'COMPLETED' ||
      this.props.ride.ride.status.indexOf('CANCELLED') !== -1)) {
      return (
        <div className="top10">
          <Button onClick={() => this.props.actions.resendReceipt(this.props.params.rideID)} bsStyle={'info'}>
            Resend ride receipt
          </Button>
        </div>
      );
    }
    return false;
  }

  renderSplitFareRiders() {
    if (!this.state.farePayments || this.state.farePayments.length < 2) return null;

    return this.state.farePayments.filter(
      rider => rider.riderId !== this.props.ride.ride.rider.id).map(rider =>
    (
        <Col xs={12} className="rightp0 leftp0 bottomp15">
          <div className="text-center">
            <hr className="top25" />
            <span
              className="subheading text-light font12 uppercase text-dark top10 header-line inline-block"
            >
              Rider
            </span>
          </div>
          <Link to={`/profile/riders/${rider.riderId}`}>
            <div className="user-wrapper inline-block">
              <div className="user-pic-wrapper align-middle cell">
                <Image responsive className="user-pic width50 min-width50" src={rider.riderPhoto} />
              </div>
              <div className="cell align-middle leftp10">
                <p className="text-light bottom0">
                  {rider.riderFullName}
                </p>
                <p className="sub-text bottom0">
                  {rider.riderId}
                </p>
              </div>
            </div>
          </Link>
        </Col>
      )
    );
  }

  renderMap(ride) {
    return (
      <div className="travel-info clearfix" style={{position: 'relative'}}>
        <div className="height250 width100p">
          {!this.props.ride.map &&
            <GoogleMap
              bootstrapURLKeys={{ key: keys.gMaps }}
              defaultCenter={{
                lat: this.props.ride.ride.startLocationLat,
                lng: this.props.ride.ride.startLocationLong,
              }}
              defaultZoom={12}
            >
              <div
                className="start-marker"
                lat={this.props.ride.ride.startLocationLat}
                lng={this.props.ride.ride.startLocationLong}
                text={'A'}
              >A</div>
            </GoogleMap>
          }
        </div>
        {this.props.ride.map &&
          <Image
            responsive
            className="map width100p max-height250"
            src={this.props.ride.map}
            alt="map with directions"
          />
        }
        <Col xs={12} className="top15 bottom15">
          <span className="cell rightp25">
            <Image
              className="from-to top10"
              src="https://media.rideaustin.com/images/2857ED52-5E64-4913-8329-F3FB59F02049_2x.png" alt=""
            />
          </span>
          <span className="cell align-middle">
            <span className="inline-block from">
              <p className="font14 text-dark bottom0">
                {ride.startedOn ? getTexasTime(moment(ride.startedOn), false).format('h:mm a') : 'Unavailable'}
              </p>
              <p className="text-grey font11">
                {this.props.ride.ride.startAddress}
              </p>
            </span>
            <span className="to">
              <div className="font14 text-dark bottom0">
                <div>{ride.completedOn ? getTexasTime(moment(ride.completedOn), false).format('h:mm a') : 'Unavailable'}</div>
              </div>
              {this.props.ride.ride.endAddress &&
                <p className="text-grey font11">{this.props.ride.ride.endAddress}</p>
              }
              {!this.props.ride.ride.endAddress &&
                <p className="text-grey font11">
                  Unavailable
                </p>
              }
            </span>
          </span>
        </Col>
      </div>
    );
  }

  renderDriver() {
    return (
      <Col xs={12} className="rightp0 leftp0">
        <div className="text-center">
          <hr className="top25" />
          <span
            className="subheading text-light font12 uppercase text-dark top10 header-line inline-block"
          >
            Driver
          </span>
        </div>
        {this.props.ride.ride.activeDriver &&
          <Link to={`/profile/drivers/${this.props.ride.ride.activeDriver.driver.id}`}>
            <div className="user-wrapper inline-block">
              <div className="user-pic-wrapper align-middle cell">
                <Image
                  responsive
                  className="user-pic width50 min-width50"
                  src={this.props.ride.ride.activeDriver.driver.photoUrl}
                />
              </div>
              <div className="cell align-middle leftp10 top10">
                <div className="text-light bottom0">
                  {this.props.ride.ride.activeDriver.driver.fullName}
                </div>
                <p className="sub-text bottom0">
                  {this.props.ride.ride.activeDriver.driver.id}&nbsp;
                  [{this.props.ride.ride.activeDriver.driver.appVersion}]
                </p>
              </div>
            </div>
          </Link>
        }
      </Col>
    );
  }

  renderRider() {
    return (
      <Col xs={12} className="rightp0 leftp0 bottomp15">
        <div className="text-center">
          <hr className="top25" />
          <span
            className="subheading text-light font12 uppercase text-dark top10 header-line inline-block"
          >Rider</span>
        </div>
        <Link to={`/profile/riders/${this.props.ride.ride.rider.id}`}>
          <div className="user-wrapper inline-block">
            <div className="user-pic-wrapper align-middle cell">
              <Image
                responsive
                className="user-pic width50 min-width50"
                src={this.props.ride.ride.rider.user.photoUrl}
              />
            </div>
            <div className="cell align-middle leftp10">
              <p className="text-light bottom0">
                {this.props.ride.ride.rider.fullName}
              </p>
              <p className="sub-text bottom0">
                {this.props.ride.ride.rider.id} [{this.props.ride.ride.rider.user.appVersion}]
              </p>
            </div>
          </div>
        </Link>
      </Col>
    );
  }

  renderLeftSide() {
    return _.map(constants.ride.leftSide, section =>
      <Col xs={12} className="rightp0 leftp0" key={section.id}>
        <div className="text-center">
          <hr className="top25" />
          <span
            className="subheading text-light font12 uppercase text-dark top10 header-line inline-block"
          >{section.name}</span>
        </div>

        {_.map(section.items, (item) => {
          const cc = _.get(this.props.ride, 'ride.riderCard.cardBrand');
          const ccImage = constants.common.cc[cc];
          const imgOrText = ccImage ? <img style={{width: '30px'}} alt="credit card" src={constants.common.cc[cc]} /> : cc;
          if (item.id === 'totalCharge') {
            return (
              <div key={item.id}>
                <div className="bottom10 text-dark ">
                  <span className="sub-text text-dark">{item.name}</span>
                  <span className="pull-right">
                    <div>
                      <span className="text-muted right10">
                        {imgOrText} •••• {_.get(this.props.ride, 'ride.riderCard.cardNumber')}
                      </span>
                      {this.getItemValue(item)}
                    </div>
                  </span>
                </div>
              </div>
            );
          }
          if (item.items) {
            return (
              <div key={item.id}>
                <div className="bottom10 text-dark ">
                  <span className="sub-text text-dark">{item.name}</span>
                  <span className="pull-right">
                    <div>{this.getItemValue(item)}</div>
                  </span>
                </div>
                {_.map(item.items, subItem =>
                  <div className="text-light" key={subItem.id}>
                    <span className="sub-text leftp10">{subItem.name}</span>
                    <span className="pull-right">
                      <div>{this.getItemValue(subItem)}</div>
                    </span>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div className="text-light" key={item.id}>
              <span className="sub-text">{item.name}</span>
              <span className="pull-right">
                <div>{this.getItemValue(item)}</div>
              </span>
            </div>
          );
        })}
      </Col>
    );
  }

  render() {
    if (this.props.ride.loading) return <Loading loading text="Loading rides" />;
    return (
      <Row className="ride">
        <Col xs={12} sm={8} smOffset={0}>
          <Col className="clearfix content-wrapper">
            <Col sm={6} className="content clearfix">
              {this.renderCancelRideBtn()}
              {this.renderResendReceiptBtn()}
              {this.renderLeftSide()}
            </Col>
            <Col sm={6} className="clearfix travel-info-wrapper top20 bottom20">
              {this.renderMap(this.props.ride.ride)}
              {this.renderDriver()}
              {this.renderRider()}
              {this.renderSplitFareRiders()}
              <ConfirmModal
                show={this.state.showCancel}
                title="Ride cancel"
                body="This ride is in progress... Are you sure you want to cancel it?"
                yesText="Cancel Ride"
                noText="Back"
                onYesClick={() =>
                  this.props.actions.cancelRide(this.props.ride.ride.id)
                    .then(() => {
                      this.setState({showCancel: false});
                      this.props.actions.getRide(this.props.params.rideID);
                    })
                }
                onNoClick={() => this.setState({showCancel: false})}
              />
            </Col>
          </Col>
        </Col>
      </Row>
    );
  }
}

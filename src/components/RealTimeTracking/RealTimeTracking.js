import React, { Component } from 'react';
import { Col, Image } from 'react-bootstrap';

import config from '../../services/config';
import constants from '../../data/constants';

export default class RealTimeTrackning extends Component {
  constructor(props) {
    super(props);

    this.state = {
      minimized: true,
    };

    if (NODE_ENV !== 'production') {
      config().setAPI('api-rc');
    }
  }

  componentDidMount() {
    if (this.props.params.token) {
      this.props.actions.startAutoFetch(this.props.params.token);
    }

    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: {lat: 29.7604267, lng: -95.3698028},
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    this.startMarker = new google.maps.Marker({
      map: this.map,
      icon: {
        url: constants.realTimeTrackning.pins.pinGreen,
        scaledSize: {
          height: constants.realTimeTrackning.pins.height,
          width: constants.realTimeTrackning.pins.width,
        },
      },
    });

    this.endMarker = new google.maps.Marker({
      map: this.map,
      icon: {
        url: constants.realTimeTrackning.pins.pinRed,
        scaledSize: {
          height: constants.realTimeTrackning.pins.height,
          width: constants.realTimeTrackning.pins.width,
        },
      },
    });

    this.polyLine = new google.maps.Polyline({
      map: this.map,
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });

    this.car = new google.maps.Marker({
      map: this.map,
      zIndex: 1000,
      optimized: false,
    });

    this.eta = setInterval(() => {
      this.props.actions.getETA();
    }, 30000);
  }

  componentWillUnmount() {
    this.props.actions.stopAutoFetch();
    clearInterval(this.eta);
  }

  onNewEndLocation(oldEndlocation, newEndLocation) {
    return !_.isEqual(oldEndlocation, newEndLocation);
  }

  getCarIcon(course) {
    const car = constants.realTimeTrackning.car;
    return {
      url: `${car.url}?rotate=${_.round(course)}`,
      size: new google.maps.Size(car.width, car.width),
      anchor: new google.maps.Point(car.width / 2, car.height / 2),
      origin: new google.maps.Point(0, 0),
      scaledSize: {
        height: car.height,
        width: car.width,
      },
    };
  }

  renderETA() {
    const { durationInMinutes } = this.props.trackingData.eta;
    const { startedOn, status } = this.props.trackingData.data;
    const isRideActive = constants.common.endedStatuses.indexOf(status) === -1;

    if (durationInMinutes && startedOn && isRideActive) {
      return (
        <div className="duration">
          <span className="eta font10">ETA</span>
          <span className="number">{durationInMinutes}</span>
          <span className="minutes thin">min</span>
        </div>
      );
    }
    return false;
  }

  renderCar() {
    const {locations, currentCourse, status} = this.props.trackingData.data;
    const isRideActive = constants.common.endedStatuses.indexOf(status) === -1;
    if (isRideActive && currentCourse) {
      const lc = _.last(locations);
      this.car.setPosition(lc);
      this.car.setIcon(this.getCarIcon(currentCourse));
      this.car.setVisible(true);
    } else {
      this.car.setVisible(false);
    }
  }

  renderError() {
    return (
      <div className="loading">
        <span className="text red">Could not get tracking data.</span>
      </div>
    );
  }

  renderLoading() {
    return (
      <div className="loading">
        <div><span className="text">Loading location tracker...</span></div>
      </div>
    );
  }

  renderStartMarker() {
    const {startLocation} = this.props.trackingData.data;
    if (startLocation) {
      this.startMarker.setVisible(true);
      this.startMarker.setPosition(startLocation);
    } else {
      this.startMarker.setVisible(false);
    }
  }

  renderEndMarker() {
    const {endLocation} = this.props.trackingData.data;
    if (endLocation) {
      this.endMarker.setVisible(true);
      this.endMarker.setPosition(endLocation);
    } else {
      this.endMarker.setVisible(false);
    }
  }

  renderMap() {
    const {locations, startLocation} = this.props.trackingData.data;
    const lc = _.last(locations);

    if (lc) {
      this.map.panTo(lc);
    } else {
      this.map.panTo(startLocation);
    }
  }

  renderInfoBox() {
    const {
      startAddress,
      endAddress,
      status,
      rideCarCategory,

      riderPhoto,
      riderFirstName,

      driverPhoto,
      driverFirstName,
      driverCar,
      driverRating,
      driverLicensePlate,

    } = this.props.trackingData.data;
    const make = _.get(driverCar, 'make');
    return (
      <div className={`info-box ${this.state.minimized ? 'minimized' : 'maximized'}`}>
        <Col
          className="changeSize"
          onClick={() => this.setState({ minimized: !this.state.minimized })}
        ><div className="arrow" />
        </Col>
        <div className="inner">
          <div className="rider">
            <div className="inner">
              <div className="photo">
                <Image src={riderPhoto} circle />
              </div>
              <div className="info">
                {this.renderETA()}
                <span className="name">{riderFirstName}</span>
                <span className="status mute thin">{constants.realTimeTrackning.statuses[status]}</span>
                <div className="directions">
                  {startAddress && endAddress &&
                    <span className="grey-line" />
                  }
                  {startAddress &&
                    <div className="start-address direction">
                      <span className="green-dot dot" />
                      <span className="address ellipis thin">{startAddress}</span>
                    </div>
                  }
                  {endAddress &&
                    <div className="end-address direction">
                      <span className="red-dot dot" />
                      <span className="address ellipis thin">{endAddress}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="driver">
            <div className="inner">
              <div className="photo">
                <Image src={driverPhoto} circle />
              </div>
              <div className="info">
                <div className="row-1">
                  <span className="name">{driverFirstName}</span>
                  <span className="car pull-right">
                    <span className="brand thin">
                      {make}
                    </span> - <span className="type thin">{rideCarCategory}</span>
                  </span>
                </div>
                <div className="row-2">
                  <div className="rating">
                    <span className="number item">{_.round(driverRating, 1)}</span>
                    <span className="star item">
                      <Image src={constants.realTimeTrackning.star} />
                    </span>
                  </div>
                  <span className="licence-plate thin">{driverLicensePlate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderHeader() {
    const { cityId } = this.props.location.query;
    const logo = constants.common.logoWhite[cityId] || constants.realTimeTrackning.logo;
    return (
      <header>
        <Image alt="logo" src={logo} style={{height: '38px'}} />
      </header>
    );
  }

  renderPolyLine() {
    const {locations} = this.props.trackingData.data;
    this.polyLine.setPath(locations);
  }

  render() {
    const {error, loading} = this.props.trackingData;

    if (!loading && !error) {
      this.renderMap();
      this.renderPolyLine();
      this.renderCar();
      this.renderStartMarker();
      this.renderEndMarker();
    }

    const isRideActive =
      constants.common.endedStatuses.indexOf(this.props.trackingData.data.status) === -1;
    if (!isRideActive) clearInterval(this.eta);

    return (
      <section className="real-time-tracking">
        {this.renderHeader()}
        {error && this.renderError()}
        {loading && this.renderLoading()}
        {!error && !loading && this.renderInfoBox()}
        <div id="map" style={{height: 'calc(100vh - 58px)', width: '100%'}} />
      </section>
    );
  }
}

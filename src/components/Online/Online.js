import React, { Component } from 'react';
import { Row, Button, Panel } from 'react-bootstrap';
import { Link } from 'react-router';

import Loading from '../Loading';
import {PaginatedTable, ConfirmModal} from '../';
import PropsWatcher from '../../containers/PropsWatcher';

export default class Online extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.mapOnlineDriver = this.mapOnlineDriver.bind(this);
  }

  componentDidMount() {
    this.onRefresh();
  }

  componentWillUnmount() {
  }

  onRefresh(cityChange) {
    this.props.getOnlineDrivers(cityChange);
    this.props.getAAADrivers(cityChange);
    this.props.getRequestedDrivers(cityChange);
  }

  mapOnlineDriver(onlineDrivers) {
    if (onlineDrivers) {
      return _.map(onlineDrivers.content, (d) => {
        const driver = Object.assign({}, d);
        driver.name = <Link to={`/profile/drivers/${_.get(driver, 'driver.id')}`}>{_.get(driver, 'driver.fullName')}</Link>;
        driver.phoneNumber = _.get(d, 'driver.phoneNumber');
        driver.carCategories = this.renderCarCategories(d);
        driver.location = (
          <div>
            <span>{`${d.latitude}, ${d.longitude}`}</span>
            {' '}
            {
              d.address ?
                <strong>{d.address}</strong> :
                <Button
                  bsSize="xsmall"
                  onClick={() =>
                    this.props.actions.getDriverLocation({
                      lat: driver.latitude,
                      lng: driver.longitude,
                      driverId: _.get(driver, 'driver.id'),
                      type: 'onlineDrivers',
                    })}
                >Get Address</Button>
            }
          </div>
        );
        return this.onlineDriversTable.tableConfig.getDataMap(driver);
      });
    }
    return [];
  }

  mapAAADriver(AAADrivers) {
    if (AAADrivers) {
      return _.map(AAADrivers.content, (d) => {
        const driver = Object.assign({}, d);
        driver.rideId = <Link to={`/ride/${driver.rideId}`}>{driver.rideId}</Link>;
        driver.riderName = <Link to={`/profile/riders/${driver.riderId}`}>{driver.riderName}</Link>;
        driver.driverName = <Link to={`/profile/drivers/${driver.driverId}`}>{driver.driverName}</Link>;
        driver.location = d.driverLatitude ? (
          <div>
            <span>{`${d.driverLatitude}, ${d.driverLongitude}`}</span>
            {' '}
            {
              d.address ?
                <div><strong>{d.address}</strong></div> :
                <Button
                  bsSize="xsmall"
                  onClick={() =>
                    this.props.actions.getDriverLocation({
                      lat: driver.driverLatitude,
                      lng: driver.driverLongitude,
                      driverId: driver.driverId,
                      type: 'AAADrivers',
                    })}
                >Get Address</Button>
            }
          </div>
        ) : 'No location data provided';

        driver.cancel = (
          <Button
            bsStyle="danger"
            bsSize="xsmall"
            onClick={() => this.setState({cancelRide: d.rideId})}
          >Cancel</Button>
        );

        return this.AAADriversTable.tableConfig.getDataMap(driver);
      });
    }
    return [];
  }

  mapRequestedDriver(requestedDrivers) {
    if (requestedDrivers) {
      return _.map(requestedDrivers.content, (d) => {
        const driver = Object.assign({}, d);
        return this.requestedDriversTable.tableConfig.getDataMap(driver);
      });
    }
    return [];
  }

  renderCarCategories(activeDriver) {
    const indents = [];
    activeDriver.carCategories.forEach((val) => {
      indents.push(
        <span>
          {val}, {' '}
        </span>
      );
    });

    return (
      <span title={activeDriver.consecutiveDeclinedRequests}>
        {indents}
      </span>
   );
  }

  renderOnlineDrivers() {
    return (
      <Panel
        className="clearfix"
        header={
          <div className="clearfix">
            <div className="pull-left topp6">Online Drivers</div>
            <div className="pull-right">
              <Button bsSize="small">{this.state.showOnlineDrivers ? 'Hide' : 'Show'}</Button>
            </div>
          </div>
        }
        collapsible
        expanded={this.state.showOnlineDrivers}
        onSelect={() => this.setState({showOnlineDrivers: !this.state.showOnlineDrivers})}
      >
        <PaginatedTable
          sortable={[
            { name: 'Name', property: 'name', sort: false },
            { name: 'Phone', property: 'phoneNumber', sort: false },
            { name: 'Location', property: 'location', sort: false },
            { name: 'Car Categories', property: 'carCategories', sort: false },
            { name: 'App Version', property: 'appVersion', sort: false },
          ]}
          ref={(ref) => { this.onlineDriversTable = ref; }}
          serverResponse={this.props.online.onlineDrivers || {}}
          loading={this.props.online.onlineDriversLoading}
          data={
            this.onlineDriversTable ? this.mapOnlineDriver(this.props.online.onlineDrivers) : []}
          onSortChange={() => {}}
          onPageChange={page => this.props.pageChange({page, type: 'onlineDrivers'})}
        />
      </Panel>
    );
  }

  renderAAADrivers() {
    return (
      <Panel
        className="clearfix"
        header={<div className="clearfix">Assigned / Active / Arrived</div>}
      >
        <PaginatedTable
          sortable={[
            { name: 'ID', property: 'rideId', sort: false },
            { name: 'Type', property: 'status', sort: false },
            { name: 'Rider', property: 'riderName', sort: false },
            { name: 'Rider Version', property: 'riderAppVersion', sort: false },
            { name: 'Driver', property: 'driverName', sort: false },
            { name: 'Driver Phone', property: 'driverPhoneNumber', sort: false },
            { name: 'Driver Version', property: 'driverAppVersion', sort: false },
            { name: 'Start Address', property: 'startAddress', sort: false },
            { name: 'End Address', property: 'endAddress', sort: false },
            { name: 'Location', property: 'location', sort: false },
            { name: 'Cancel Ride', property: 'cancel', sort: false },
          ]}
          ref={(ref) => { this.AAADriversTable = ref; }}
          serverResponse={this.props.online.AAADrivers || {}}
          loading={this.props.online.AAADriversLoading}
          data={
            this.AAADriversTable ?
              this.mapAAADriver(this.props.online.AAADrivers) :
              []
          }
          onSortChange={() => {}}
          onPageChange={page => this.props.pageChange({page, type: 'AAADrivers'})}
        />
      </Panel>
    );
  }

  renderRequestedDrivers() {
    return (
      <Panel
        className="clearfix"
        header={<div className="clearfix">Requests</div>}
      >
        <PaginatedTable
          sortable={[
            { name: 'Rider Name', property: 'riderName', sort: false },
            { name: 'Rider Version', property: 'riderAppVersion', sort: false },
            { name: 'Start Address', property: 'startAddress', sort: false },
          ]}
          ref={(ref) => { this.requestedDriversTable = ref; }}
          serverResponse={this.props.online.requestedDrivers || {}}
          loading={this.props.online.requestedDriversLoading}
          data={
            this.requestedDriversTable ?
              this.mapRequestedDriver(this.props.online.requestedDrivers) :
              []
          }
          onSortChange={() => {}}
          onPageChange={page => this.props.pageChange({page, type: 'requestedDrivers'})}
        />
      </Panel>
    );
  }

  render() {
    if (this.props.online.loading) return <Loading loading />;
    return (
      <Row className="online">
        <PropsWatcher prop="common.selectedCity" handler={() => this.onRefresh(true)} />
        <Button className="bottom15" bsStyle="success" onClick={() => this.onRefresh()}>Refresh</Button>
        {this.renderOnlineDrivers()}
        {this.renderAAADrivers()}
        {this.renderRequestedDrivers()}
        <ConfirmModal
          show={!!this.state.cancelRide}
          title="Ride cancel"
          body="This ride is in progress... Are you sure you want to cancel it?"
          yesText="Cancel Ride"
          noText="Back"
          onYesClick={() =>
            this.props.actions.cancelRide(this.state.cancelRide)
              .then(() => {
                this.setState({cancelRide: null});
                this.props.getAAADrivers();
              })
          }
          onNoClick={() => this.setState({cancelRide: null})}
        />
      </Row>
    );
  }
}

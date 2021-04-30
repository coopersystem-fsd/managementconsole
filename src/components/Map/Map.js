import GoogleMap from 'google-map-react';
import React, { Component } from 'react';
import {
  Checkbox,
  Col,
  FormGroup,
  Panel,
  Row,
  Badge,
} from 'react-bootstrap';
import { browserHistory } from 'react-router';
import Loading from '../Loading';
import keys from '../../services';
import style from './style.scss';
import constants from '../../data/constants';

export default class Map extends Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.actions.startUsersPolling();
  }

  componentWillUnmount() {
    this.props.actions.stopUsersPolling();
  }

  getDistanceToMouse(markerPos, mousePos, markerProps) {
    const x = markerPos.x;
    // because of marker non symmetric,
    // we transform it central point to measure distance from marker circle center
    // you can change distance function to any other distance measure
    const y = markerPos.y - 4 - (20 / 2);

    // and i want that hover probability on markers with text === 'A' be greater than others
    // so i tweak distance function (for example it's more likely to me that
    // user click on 'A' marker)
    // another way is to decrease distance for 'A' marker
    // this is really visible on small zoom values or if there are a lot of markers on the map
    const distanceKoef = markerProps.text !== 'A' ? 1.5 : 1;
    return distanceKoef *
      Math.sqrt(((x - mousePos.x) * (x - mousePos.x)) + ((y - mousePos.y) * (y - mousePos.y)));
  }

  renderMap() {
    const {areaGeometry} =
      _.find(this.props.common.cities, {id: _.toNumber(this.props.common.selectedCity)}) || {};
    if (areaGeometry) {
      return (
        <GoogleMap
          style={{width: '100%', height: '70vh'}}
          center={{lat: areaGeometry.centerPointLat, lng: areaGeometry.centerPointLng}}
          defaultZoom={12}
          hoverDistance={10}
          distanceToMouse={this.getDistanceToMouse}
          bootstrapURLKeys={{key: keys.gMaps}}
        >{this.renderMarkers()}</GoogleMap>

      );
    }
    return false;
  }

  renderMarkers() {
    const markers =
    _.chain(this.props.map.users)
      .filter(({status}) => this.props.map.filters.indexOf(status) > -1)
      .map((marker) => {
        const {
          id,
          activeDriver,
          rider,
          startLocationLat,
          startLocationLong,
        } = marker;

        const status = marker.status ? marker.status : _.get(activeDriver, 'status');
        const driverId = _.get(activeDriver, 'driver.id');
        const riderId = _.get(rider, 'id');
        const driverName = _.get(activeDriver, 'driver.fullName');
        const driverPhoneNumber = _.get(activeDriver, 'driver.phoneNumber');
        const address = this.props.map.addresses[driverId];
        const className = `map-marker marker-${_.toLower(status)}`;
        const isRiderRequest = status === 'REQUESTED_RIDER';

        const lat = isRiderRequest ? startLocationLat : activeDriver.latitude;
        const lng = isRiderRequest ? startLocationLong : activeDriver.longitude;

        const markerId = status + driverId + riderId + driverName;

        return (
          <div
            key={`marker-${markerId}`}
            className={className}
            lat={lat}
            lng={lng}
          >
            <span className="icon">{_.find(constants.map.markers, {id: status}).letter}</span>
            <div className="marker-info">
              {id && <button onClick={() => browserHistory.push(`/ride/${id}`)}>View ride</button>}
              {riderId && <button onClick={() => browserHistory.push(`/profile/riders/${riderId}`)}>View rider</button>}
              {status === 'AWAY' ? <button onClick={() => this.props.actions.setDriverOffline({id, driverId})}>Set offline</button> : null}
              {driverId && <button onClick={() => browserHistory.push(`/profile/drivers/${driverId}`)}>View driver</button>}
              <div>{driverName}</div>
              <div>{driverPhoneNumber === 0 ? '' : driverPhoneNumber}</div>
              <div>Lat: {lat.toFixed(4)}</div>
              <div>Lon: {lng.toFixed(4)}</div>
              {address ?
                address.currentAddress :
                <button
                  onClick={() => this.props.actions.getAddress({lat, lng}, driverId)}
                >Get Address</button>
              }
            </div>
          </div>
        );
      })
      .value();

    return markers.length ? markers : null;
  }

  renderDriversCount() {
    const {availableDrivers, totalDrivers} = this.props.map;
    return (
      <div>
        <span>There are </span>
        <strong>{availableDrivers || 0}</strong>
        <span> unassigned drivers out of </span>
        <strong>{totalDrivers || 0}</strong>
      </div>
    );
  }

  renderPanel() {
    return (
      <Panel header={this.renderDriversCount()}>
        <Row>
          <Col xs={12} sm={12}>
            <FormGroup inline>
              {_.map(constants.map.markers, marker =>
                <div key={marker.id} className={`legend-marker marker-${_.toLower(marker.id)}`}>
                  <span className="icon">{marker.letter}</span>
                  <Checkbox
                    inline
                    onChange={() => this.props.actions.toggleFilter(marker.id)}
                    checked={this.props.map.filters.indexOf(marker.id) > -1}
                  >{marker.name} <Badge>{this.props.map.count[marker.id] || 0}</Badge>
                  </Checkbox>
                </div>
              )}
            </FormGroup>
          </Col>
        </Row>
      </Panel>
    );
  }

  render() {
    return (
      <div className={style.map}>
        <Col xs={12}>{ this.renderMap() }</Col>
        {this.props.map.loading && <Loading height="200px" />}
        {!this.props.map.loading &&
          <Row>
            <Col xs={12}>{this.renderPanel()}</Col>
          </Row>
        }
      </div>
    );
  }
}

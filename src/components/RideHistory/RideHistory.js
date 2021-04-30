import React, { Component } from 'react';
import { Image, Col } from 'react-bootstrap';
import {Link} from 'react-router';
import {PaginatedTable} from '../';
import './RideHistory.scss';
import PropsWatcher from '../../containers/PropsWatcher';
import constants from '../../data/constants';
import {getTexasTime} from '../../helpers/common';

export default class RideHistory extends Component { // eslint-disable-line
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 100,
      serverResponse: {
        content: [],
      },
      sort: 'id',
      desc: true,
      loading: true,
      filters: constants.upgrades.slice(),
      sortable: [
        { name: 'Map', property: 'map', sort: false },
        { name: 'RideID', property: 'rideId', sort: false },
        { name: 'Status', property: 'formattedStatus', sort: 'status' },
        { name: 'From / To', property: 'fromTo', sort: false },
        { name: 'Driver', property: 'driver', sort: false },
        { name: 'Rider', property: 'rider', sort: false },
        { name: 'Start / End', property: 'startEnd', sort: 'startedOn' },
        { name: 'Estimated Price', property: 'estimatedFare', sort: false },
        { name: 'Total Price', property: 'totalFare', sort: true },
        { name: 'Tip Value', property: 'tip', sort: true },
        { name: 'Tip Date', property: 'tippedOn', sort: true },
      ],
    };
  }

  componentDidMount() {
    this.handleLoad();
  }

  getFilterParams() {
    const {page, cityId, pageSize} = this.state;
    const p = this.props.params;
    const userId =
      p.userType === 'drivers' ? {driverId: p.userId} :
      p.userType === 'riders' ? {riderId: p.userId} :
      {};
    const params = Object.assign({}, {
      page,
      sort: this.state.sort,
      desc: this.state.desc,
      charged: true,
      pageSize,
      status: ['COMPLETED', 'RIDER_CANCELLED', 'DRIVER_CANCELLED'].join(','),
      avatarType: 'ADMIN',
    },
    userId,
    );
    if (cityId === '*') delete params.cityId;

    return params;
  }

  getRideMap(rides) {
    const id = _.first(rides);
    if (id && !this.props.rideHistory.maps[id]) {
      this.props.actions.getRideMap(id)
        .then(() => this.getRideMap(rides.slice(1)));
    }
    return false;
  }

  mapUsers(content) {
    return this.table ? _.map(content, (row) => {
      const mappedRow = Object.assign({}, row);
      mappedRow.map =
        this.props.rideHistory.maps[row.id] && this.props.rideHistory.maps[row.id] === 'no map' ?
          '' : this.props.rideHistory.maps[row.id] ?
            <a
              href={this.props.rideHistory.maps[row.id]}
              target="_blank"
              rel={'noopener'}
            ><Image style={{maxWidth: this.props.mapWidth || '300px'}} responsive src={this.props.rideHistory.maps[row.id]} />
            </a> : row.status === 'COMPLETED' ?
              <div className="text-center">Loading...</div> : '';
      mappedRow.rideId = <Link to={`/ride/${mappedRow.id}`}>{mappedRow.id}</Link>;

      mappedRow.formattedStatus =
        _.find(constants.common.driverStatus.slice(), {id: row.status}).name;

      mappedRow.fromTo = (
        <div>
          <div>{row.startAddress}</div>
          <div>{row.endAddress || ''}</div>
        </div>
      );

      mappedRow.driver = row.driver;

      mappedRow.rider = row.rider;

      mappedRow.startEnd = (
        <div>
          {row.startedOn && <span>{getTexasTime(moment(row.startedOn, false), false).format('MMM DD YYYY, h:mm A')} - </span>}
          <span>{getTexasTime(moment(row.completedOn || row.cancelledOn, false), false).format(row.startedOn ? 'LT' : 'MMM DD YYYY, h:mm A')}</span>
        </div>
      );

      mappedRow.estimatedFare = `$${row.estimatedFare ? row.estimatedFare : 0}`;

      mappedRow.totalFare = `$${row.totalFare}`;

      mappedRow.tip = `$${row.tip ? row.tip : 0}`;

      mappedRow.tippedOn = row.tippedOn ? getTexasTime(moment(row.tippedOn)).format('MMM DD YYYY, h:mm A') : '';

      return this.table.tableConfig.getDataMap(mappedRow);
    }) : null;
  }

  handleLoad() {
    const params = this.getFilterParams();
    this.props.actions.getRideHistory(params)
      .then(({payload: {serverResponse, error}}) => {
        const state = { loading: false };
        if (!error) {
          state.serverResponse = serverResponse;
          const rides = _.chain(serverResponse.content)
            // .filter(({status}) => status === 'COMPLETED')
            .map(({id}) => id)
            .value();

          this.getRideMap(rides);
        }
        this.setState(state);
      });
  }

  renderTable({ serverResponse, sortable } = this.state) {
    if (serverResponse) {
      return (
        <PaginatedTable
          className={'payments-table'}
          ref={(ref) => { this.table = ref; }}
          serverResponse={serverResponse}
          data={this.mapUsers(_.get(this.props.rideHistory.serverResponse, 'content'))}
          loading={this.props.rideHistory.loading}
          sortable={sortable}
          onSortChange={(a, e) =>
            this.setState({
              sort: e.sort.column,
              desc: e.sort.desc,
            }, this.handleLoad)}
          onPageChange={page => this.setState({page}, this.handleLoad)}
          defaultSort={null}
          noDataText="User has no ride history."
        />
      );
    }
    return false;
  }

  render() {
    return (
      <Col className="ridehistory clearfix">
        <PropsWatcher prop="common.selectedCity" handler={cityId => this.setState({page: 0, cityId}, this.handleLoad)} />
        {this.renderTable()}
      </Col>
    );
  }
}

import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import moment from 'moment';
import _ from 'lodash';
import { browserHistory, Link } from 'react-router';
import {
  Modal,
  Button,
  Well,
  Col,
  FormControl,
  ControlLabel,
  FormGroup,
  ButtonGroup,
  ButtonToolbar,
  Label,
} from 'react-bootstrap';
import validator from 'validator';
import DatePicker from 'react-datepicker';
import {PaginatedTable, ConfirmModal} from '../';
import styles from './Rides.scss';
import {getTexasTime} from '../../helpers/common';
import PropsWatcher from '../../containers/PropsWatcher';
import StuckRides from './StuckRides';
import constants from '../../data/constants';

require('react-datepicker/dist/react-datepicker.css');

class Rides extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      showStuckRides: false,
      id: '',
      avatarType: 'ADMIN',
      page: 0,
      status: 'COMPLETED',
      timezone: 'texas',
      loading: true,
      column: null,
      desc: true,
      sort: 'completedOn',
      tableSort: null,
      filterDate: getTexasTime(moment().startOf('day')),
      searchIsValid: true,
      pageSize: 50,
    };

    this.renderSearchBox = this.renderSearchBox.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onFilterStatus = this.onFilterStatus.bind(this);
    this.getRidesTypeParams = this.getRidesTypeParams.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.handleServerResponse = this.handleServerResponse.bind(this);
    this.renderExportModal = this.renderExportModal.bind(this);
    this.onServerReport = this.onServerReport.bind(this);
    this.onShowStuckRides = this.onShowStuckRides.bind(this);
    this.onCloseStuckRides = this.onCloseStuckRides.bind(this);
    this.onCityChange = this.onCityChange.bind(this);
    this.onCloseStuckCancelModal = this.onCloseStuckCancelModal.bind(this);
    this.onLoadRides = this.onLoadRides.bind(this);
  }

  componentWillMount() {
    this.getRidesDebounced = _.debounce(this.onLoadRides, 1000);
    this.onLoadRides();
  }

  onServerReport() {
    const {
      actions: {sendServerReportAction},
      notificationsActions: {showError, showNotification},
    } = this.props;

    const ridesTypeParams = this.getRidesTypeParams();
    const query = {
      ...ridesTypeParams,
      status: this.state.status,
      cityId: this.props.common.selectedCity,
    };

    sendServerReportAction(query)
      .then(() => { showNotification(`Report was sent to ${this.props.user.email}`); })
      .catch(showError);
  }

  onShowStuckRides() {
    this.props.actions.getStuckRides();
    this.setState({showStuckRides: true});
  }

  onCloseStuckRides() {
    this.setState({showStuckRides: false});
  }

  onCloseStuckCancelModal() {
    this.setState({showStuckCancelMessage: false});
  }

  onFilterStatus({target: {value: status}}) {
    this.setState({searchIsValid: true, id: '', status, loading: true, page: 0},
      this.onLoadRides);
  }

  onCityChange() {
    this.setState({ page: 0 }, this.onLoadRides);
  }

  onDateChange(selectedDate) {
    const options = {searchIsValid: true, id: '', page: 0, filterDate: selectedDate ? getTexasTime(selectedDate.startOf('day')) : null};

    this.setState(options, this.onChangeTimezone);
  }

  onChangeTimezone(timezone = this.state.timezone) {
    const {filterDate} = this.state;
    let startDay = filterDate ? this.state.filterDate.clone() : null;

    if (timezone === 'gmt' && filterDate) {
      startDay = startDay.utc().startOf('day');
    } else if (timezone === 'texas' && filterDate) {
      startDay = getTexasTime(startDay);
    } else if (filterDate) {
      const offset = moment().utcOffset();
      startDay = startDay.utcOffset(offset).startOf('day');
    }

    this.setState({
      timezone,
      convertedFilterDate: startDay,
      loading: true,
      page: 0}, this.onLoadRides);
  }

  onLoadRides() {
    this.setState({loading: true});
    const {actions: {getRidesAction, getRideAction}} = this.props;
    const {id, avatarType, page, status, sort, desc, pageSize} = this.state;
    const params =
      Object.assign({},
        {id, avatarType, page, status, sort, desc, pageSize, format: 'compact'}, this.getRidesTypeParams());

    const promise = id ? getRideAction(id) : getRidesAction(params);

    promise.then(this.handleServerResponse);
  }

  onPageChange(page) {
    this.setState({page, loading: true}, this.onLoadRides);
  }

  onSortChange({column, direction}) {
    const sort = this.tableConfig.getSortPropertyByName(column);
    const desc = direction === 1;
    const tableSort = { direction, column };
    this.setState({sort, desc, tableSort, loading: true}, this.onLoadRides);
  }

  getRidesTypeParams() {
    const params = {};
    const { convertedFilterDate, status, filterDate, timezone } = this.state;
    const filteredDate = convertedFilterDate || filterDate;
    const rideCancelled = ['DRIVER_CANCELLED', 'RIDER_CANCELLED', 'ADMIN_CANCELLED'].indexOf(status) > -1;
    const rideInProgress = ['ACTIVE', 'REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_REACHED'].indexOf(status) > -1;
    let startDate;
    let endDate;

    if (timezone === 'texas' && filteredDate) {
      startDate = getTexasTime(filteredDate.clone().startOf('day'));
      endDate = getTexasTime(filteredDate.clone().endOf('day'));
    } else if (filteredDate) {
      startDate = filteredDate.clone().startOf('day');
      endDate = filteredDate.clone().endOf('day');
    }

    if (rideCancelled && filteredDate) {
      params.sort = 'cancelledOn';
      params.cancelledOnAfter = startDate.toISOString();
      params.cancelledOnBefore = endDate.toISOString();
    } else if (rideInProgress) {
      params.sort = 'createdDate';
      if (filteredDate) {
        params.createdOnAfter = startDate.toISOString();
        params.createdOnBefore = endDate.toISOString();
      }
    } else if (filteredDate) {
      params.completedOnAfter = startDate.toISOString();
      params.completedOnBefore = endDate.toISOString();
    }

    return params;
  }

  getTimezone(time) {
    if (!time) return '';

    const {timezone} = this.state;
    const timeFormat = 'MMMM Do YYYY, h:mm a';

    let formatedWithTimezone = moment(time).format(timeFormat);

    if (timezone === 'gmt') {
      formatedWithTimezone = moment.utc(time).format(timeFormat);
    }

    if (timezone === 'texas') {
      formatedWithTimezone = getTexasTime(moment.utc(time), false).format(timeFormat);
    }

    return formatedWithTimezone;
  }

  generateServerResponse(data) {
    return {
      first: true,
      firstPage: true,
      last: true,
      lastPage: true,
      number: 0,
      numberOfElements: data.length,
      size: 100,
      totalElements: data.length,
      totalPages: 1,
    };
  }

  handleServerResponse({payload}) {
    const {loading} = payload;
    let {data, serverResponse} = payload;

    if (payload.error) return this.setState({loading: false, serverResponse, tableData: []});

    const viewRideButton = rideId => (
      <Button
        bsStyle="primary"
        bsSize="xsmall"
        onClick={() => browserHistory.push(`/ride/${rideId}`)}
      >Ride Details</Button>
    );

    if (!data) {
      data = [];
      serverResponse = this.generateServerResponse(data);
    }

    const tableData = data.length > 0 ? _.map(data, ({
        id,
        riderId,
        riderFullname,
        driverId,
        driverFullname,
        startedOn,
        completedOn,
        tip,
        tippedOn,
        distanceTravelled = 0,
        cancelledOn,
        carCategory,
      }) => {
      const r = {
        id,
        riderId: <Link to={`/profile/riders/${riderId}`}>{riderId}</Link>,
        riderName: riderFullname,
        carType: carCategory === 'REGULAR' ? 'STANDARD' : carCategory,
        driverId: <Link to={`/profile/drivers/${driverId}`}>{driverId}</Link>,
        driverName: driverFullname !== 'null null' ? driverFullname : 'No driver assigned',
        started: this.getTimezone(startedOn),
        completed: this.getTimezone(completedOn),
        distance: `${distanceTravelled} miles`,
        tipValue: `$${tip || 0}`,
        tipDate: this.getTimezone(tippedOn),
        cancelledOn: this.getTimezone(cancelledOn),
        action: viewRideButton(id),
      };

      const mappedToTable = this.tableConfig.getDataMap(r);
      return mappedToTable;
    }) : [];
    this.setState({tableData, serverResponse, loading});
    return false;
  }

  renderFilterRides() {
    const {status} = this.state;
    return (
      <Col xs={12} sm={2}>
        <FormGroup controlId="formControlsSelect">
          <ControlLabel>Type</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="drivers"
            value={status}
            onChange={this.onFilterStatus}
          >
            {_.map(constants.rides.filters.status, ({id, name}) =>
              <option key={_.uniqueId()} value={id}>{name}</option>)};
          </FormControl>
        </FormGroup>
      </Col>
    );
  }

  renderDatepicker() {
    return (
      <Col xs={12} sm={2} className="">
        <FormGroup>
          <ControlLabel>Date </ControlLabel>
          <DatePicker
            className="form-control"
            isClearable={false}
            maxDate={moment()}
            dateFormat="YYYY-MM-DD"
            selected={this.state.filterDate}
            onChange={this.onDateChange}
          />
        </FormGroup>
      </Col>
    );
  }

  renderTimezones() {
    const {timezone} = this.state;
    const that = this;
    return (
      <Col xs={12} sm={3} className="top25 leftp0 rightp0 timezones-buttons">
        <FormGroup>
          <ButtonToolbar>
            <ButtonGroup justified>
              {_.map(constants.rides.timeZones, ({id, name}) =>
                <Button
                  href="#"
                  key={_.uniqueId()}
                  bsStyle={timezone === id ? 'primary' : 'default'}
                  onClick={() => { that.onChangeTimezone(id); }}
                >{name}</Button>
              )}
            </ButtonGroup>
          </ButtonToolbar>
        </FormGroup>
      </Col>
    );
  }

  renderSearchBox() {
    const that = this;
    function searchById({target: {value}}) {
      if (!validator.isNumeric(value) && !!value) {
        that.setState({ searchIsValid: false });
        return;
      }
      if (that.state.id !== value) {
        that.setState({ searchIsValid: true, id: value });
        that.getRidesDebounced();
      }
    }
    function validateInput(ev) {
      const event = ev;
      event.target.value = ev.target.value.replace(/[^0-9]/, '');
    }
    return (
      <Col xs={12} sm={2} className="top25">
        <FormGroup validationState={this.state.searchIsValid ? null : 'error'}>
          <FormControl
            type="text"
            placeholder="Search Ride ID"
            value={this.state.id}
            onChange={(event) => {
              validateInput(event);
              searchById(event);
            }}
          />
        </FormGroup>
      </Col>
    );
  }

  renderActions() {
    return (
      <Col xs={12} sm={3} className="top25">
        <ButtonToolbar>
          <Button onClick={() => this.onServerReport()}>Server Report</Button>
          <Button onClick={() => this.setState({openExportModal: true})}>Export CSV</Button>
        </ButtonToolbar>
      </Col>
    );
  }

  renderDashboard() {
    return (
      <Well bsSize="small" className="clearfix">
        {this.renderFilterRides()}
        {this.renderDatepicker()}
        {this.renderTimezones()}
        {this.renderSearchBox()}
        {this.renderActions()}
      </Well>
    );
  }

  renderTable() {
    const setTableconfig = function (ref) {
      if (!this.tableConfig && ref.tableConfig) {
        this.tableConfig = ref.tableConfig;
      }
    }.bind(this);

    const {tableData = [], serverResponse = {}, loading, tableSort } = this.state;

    return (
      <PaginatedTable
        data={tableData}
        serverResponse={serverResponse}
        sortable={[
          { name: 'Rider id', property: 'riderId', sort: 'rider.user.id' },
          { name: 'Rider name', property: 'riderName', sort: 'rider.user.firstname' },
          { name: 'Cartype 🚗', property: 'carType', sort: false },
          { name: 'Driver id', property: 'driverId', sort: 'activeDriver.driver.id' },
          { name: 'Driver name', property: 'driverName', sort: 'activeDriver.driver.user.firstname' },
          { name: 'Started', property: 'started', sort: 'startedOn' },
          { name: 'Completed', property: 'completed', sort: 'completedOn' },
          { name: 'Distance', property: 'distance', sort: 'distanceTravelled' },
          { name: 'Tip value', property: 'tipValue', sort: 'fareDetails.tip' },
          { name: 'Tip date', property: 'tipDate', sort: 'tippedOn' },
          { name: 'Cancelled', property: 'cancelledOn', sort: 'cancelledOn' },
          { name: 'Action', property: 'action', sort: false },
        ]}
        loading={loading}
        onSortChange={this.onSortChange}
        ref={setTableconfig}
        onPageChange={this.onPageChange}
        defaultSort={tableSort}
      />
    );
  }

  renderExportModal() {
    const {openExportModal} = this.state;
    const sendRidesData = () => {
      const {
        actions: {sendCSVAction},
        notificationsActions: {showError, showNotification},
      } = this.props;

      const body = Object.assign({},
        { status: this.state.status },
        this.getRidesTypeParams(),
        {cityId: this.props.common.selectedCity});

      this.setState({openExportModal: false});

      sendCSVAction(body)
        .then(() => { showNotification(`CSV export was sent to ${this.props.user.email}`); })
        .catch(showError);
    };

    if (openExportModal) {
      return (
        <ConfirmModal
          show={openExportModal}
          title={'Export Rides Data'}
          body={['This will send rides data to your email. ', <Label>{this.props.user.email}</Label>]}
          onYesClick={sendRidesData}
          onNoClick={() => this.setState({openExportModal: false})}
          yesText={'Send'}
          noText={'Cancel'}
        />
      );
    }
    return false;
  }

  render() {
    return (
      <div className="rides">
        <PropsWatcher prop="common.selectedCity" handler={this.onCityChange} />
        {this.renderDashboard()}
        {this.renderTable()}
        {this.renderExportModal()}
        <StuckRides
          show={this.state.showStuckRides}
          loadingStuckRides={this.props.loadingStuckRides}
          stuckRides={this.props.stuckRides}
          onClose={this.onCloseStuckRides}
        />
        <Modal show={this.state.showStuckCancelMessage} onHide={this.onCloseStuckCancelModal}>
          <Modal.Header>
            <Modal.Title>Cancel Stuck Rides</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>We are cancelling all stuck rides. It can take few seconds. Please wait.</h4>
          </Modal.Body>
          <Modal.Footer />
        </Modal>

      </div>
    );
  }
}

export default cssModules(Rides, styles);

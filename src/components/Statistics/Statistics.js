import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import cssModules from 'react-css-modules';
import {
  Well,
  Col,
  FormControl,
  ControlLabel,
  FormGroup,
  Panel,
} from 'react-bootstrap';
import {LineChart, Line, XAxis, YAxis, Tooltip, Legend} from 'recharts';
import moment from 'moment';
import {PaginatedTable} from '../';
import styles from './Statistics.scss';
import {getTexasTime} from '../../helpers/common';
import Loading from '../Loading';
import PropsWatcher from '../../containers/PropsWatcher';

require('react-datepicker/dist/react-datepicker.css');


class Statistics extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().subtract(15, 'days').startOf('day'),
      endDate: moment().endOf('day'),
      searchIsValid: true,
      zipCode: '',
      pageSize: 100,
      ridesReport: {
        sort: 'ridesCount',
        desc: false,
      },
      driverRidesReport: {
        sort: 'completedRides',
        desc: true,
        page: 0,
        tableSort: {
          column: 'Total Rides',
          direction: 1,
        },
        sortableColumns: [
            { name: 'Name', property: ({firstName, lastName}) => `${firstName} ${lastName}`, sort: 'u.firstName' },
            { name: 'Total Rides', property: 'completedRides', sort: true },
            { name: 'Distance Travelled', property: 'distanceTraveledInMiles', sort: true },
            { name: 'Total Fare', property: 'totalFare', sort: true },
            { name: 'Driver Earnings', property: 'driverPayment', sort: true },
        ],
      },
      ridesZipCodeReport: {
        sort: 'rideCount',
        desc: true,
        tableSort: {
          column: 'Total Rides',
          direction: 1,
        },
        sortableColumns: [
            { name: 'Zipcode', property: 'zipCode', sort: true },
            { name: 'Total Rides', property: 'rideCount', sort: true },
        ],
      },
      trackingReport: {
        sort: 'rides',
        desc: true,
        tableSort: {
          column: 'Rides',
          direction: 1,
        },
        sortableColumns: [
          { name: 'Campaign', property: 'campaign', sort: true },
          { name: 'Source', property: 'source', sort: true },
          { name: 'Medium', property: 'medium', sort: true },
          { name: 'Rides', property: 'rides', sort: true },
          { name: 'Total $', property: 'fare', sort: true },
          { name: 'Driver Payment $', property: 'driverPayment', sort: true },
          { name: 'RA Payment $', property: 'raPayment', sort: true },
          { name: 'Total KM', property: 'distance', sort: true },
        ],
      },
    };
    this.renderDashboard = this.renderDashboard.bind(this);
    this.setChartRangeTitle = this.setChartRangeTitle.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.renderDriversRidesTable = this.renderDriversRidesTable.bind(this);
    this.handleRideReportResponse = this.handleRideReportResponse.bind(this);
  }

  componentDidMount() {
    this.setChartRangeTitle();
    this.handleLoadDebounced = _.debounce(this.setChartRangeTitle, 300);
  }

  componentDidUpdate() {
    this.handleRideReportResponse();
  }

  onChangeDate({type, newDate}) {
    const clearPage = Object.assign({}, this.state.driverRidesReport, {page: 0});
    const newState = {[type]: newDate, driverRidesReport: clearPage};
    this.setState(newState, () => this.setChartRangeTitle());
  }

  setChartRangeTitle() {
    let chartRangeTitle = `${this.state.startDate.format('MMM Do')} - ${this.state.endDate.format('MMM Do')}`;
    if (this.state.zipCode) chartRangeTitle = `${chartRangeTitle} | Zipcode: ${this.state.zipCode}`;
    this.setState({chartRangeTitle}, this.handleLoad);
  }

  handleRideReportResponse() {
    if (this.props.statistics.ridesReportLoading && this.state.rides) {
      this.setState({rides: null});
    }

    if (!this.props.statistics.ridesReportLoading && !this.state.rides) {
      let rideCountForDay =
      _.chain(this.props.statistics.ridesReport)
        .orderBy(['date'])
        .map(({date, ridesCount: Rides}) => {
          const name = getTexasTime(moment.utc(date)).format('YYYY-MM-DD');
          return { name, Rides };
        })
        .value();

      if (rideCountForDay.length === 1) {
        rideCountForDay = rideCountForDay.concat(rideCountForDay);
      }

      this.setState({rides: rideCountForDay});
    }
  }

  handleLoad(loadReports = ['driverRidesReport', 'ridesZipCodeReport', 'ridesReport', 'trackingReport']) {
    const {
      startDate,
      endDate,
      driverRidesReport,
      ridesReport,
      ridesZipCodeReport,
      trackingReport,
      pageSize,
      zipCode,
    } = this.state;
    const completedOnAfter = getTexasTime(startDate).toISOString();
    const completedOnBefore = getTexasTime(endDate).toISOString();
    const commonParams = {
      completedOnAfter,
      completedOnBefore,
      avatarType: 'ADMIN',
      pageSize,
      zipCode,
      timeZoneOffset: '-06:00',
      cityId: _.get(this.props.common, 'selectedCity'),
    };
    if (commonParams.zipCode === '') delete commonParams.zipCode;

    const ridesReportParams = Object.assign({}, ridesReport, commonParams);
    const driverRidesReportParams = Object.assign({}, driverRidesReport, commonParams);
    const ridesZipCodeReportParams = Object.assign({},
      ridesZipCodeReport, commonParams);
    const trackingReportParams = Object.assign({}, trackingReport, commonParams);
    const reports = {
      ridesReport: () => this.props.loadRidesReport(ridesReportParams),
      driverRidesReport: () => this.props.loadDriverRidesReport(driverRidesReportParams),
      ridesZipCodeReport: () => this.props.loadRidesZipCodeReport(ridesZipCodeReportParams),
      trackingReport: () => this.props.loadTrackingReport(trackingReportParams),
    };

    _.forEach(loadReports, (report) => {
      if (reports[report]) reports[report]();
    });
  }

  handleTableChange({page, sortData, type}) {
    const changedReport = Object.assign({}, this.state[type]);

    if (sortData) {
      Object.assign(changedReport, {
        sort: sortData.sort.column,
        desc: sortData.sort.desc,
        tableSort: sortData.tableSort,
      });
    }

    if (page) changedReport.page = page;
    this.setState({[type]: changedReport}, () => this.handleLoad([type]));
  }

  renderChart() {
    return (
      <Panel
        className="overflow-auto"
        header={<h4>Ride Counts Per Day - {this.state.chartRangeTitle}</h4>}
      >
        {!this.state.rides && <Loading loading />}
        {this.state.rides &&
          <LineChart
            style={{margin: 'auto'}}
            width={900}
            height={300}
            data={this.state.rides}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Rides" stroke="#82ca9d" />
          </LineChart>
        }
      </Panel>
    );
  }

  renderDashboard() {
    return (
      <Well bsSize="small" className="clearfix">
        <Col xs={12} sm={2} className="">
          <FormGroup>
            <ControlLabel>Start Date</ControlLabel>
            <DatePicker
              className="form-control"
              isClearable={false}
              maxDate={this.state.endDate}
              dateFormat="YYYY-MM-DD"
              selected={this.state.startDate}
              onChange={newDate => this.onChangeDate({type: 'startDate', newDate})}
            />
          </FormGroup>
        </Col>
        <Col xs={12} sm={2} className="">
          <FormGroup>
            <ControlLabel>End Date</ControlLabel>
            <DatePicker
              className="form-control"
              isClearable={false}
              minDate={this.state.startDate}
              maxDate={moment()}
              dateFormat="YYYY-MM-DD"
              selected={this.state.endDate}
              onChange={newDate => this.onChangeDate({type: 'endDate', newDate})}
            />
          </FormGroup>
        </Col>
        <Col xs={12} sm={2} className="">
          <FormGroup validationState={this.state.searchIsValid ? null : 'error'}>
            <ControlLabel>Filter by zipcode</ControlLabel>
            <FormControl
              type="text"
              value={this.state.zipCode}
              onChange={({target: {value: zipCode}}) => {
                this.setState({zipCode}, this.handleLoadDebounced);
              }}
            />
          </FormGroup>
        </Col>
      </Well>
    );
  }

  renderDriversRidesTable(driversRidesReport = {content: []}, loading = true) {
    let content = [];
    let tableSort;
    const arrayIsNotEmpty = !_.isEmpty(driversRidesReport.content);

    if (arrayIsNotEmpty && this.driversRidesReportTable) {
      tableSort = this.state.driverRidesReport.tableSort;
      content = _.map(driversRidesReport.content, row =>
        this.driversRidesReportTable.tableConfig.getDataMap(row));
    }

    return (
      <Panel header={<h4>Driver Rides - {this.state.chartRangeTitle}</h4>}>
        <PaginatedTable
          ref={(ref) => { this.driversRidesReportTable = ref; }}
          serverResponse={driversRidesReport}
          data={content}
          loading={loading}
          onSortChange={(e, data) => { this.handleTableChange({sortData: data, type: 'driverRidesReport'}); }}
          onPageChange={(page) => { this.handleTableChange({page, type: 'driverRidesReport'}); }}
          defaultSort={tableSort}
          sortable={this.state.driverRidesReport.sortableColumns}
        />
      </Panel>
    );
  }

  renderZipcodeTable(ridesZipCodeReportResponse, ridesZipCodeReportLoading = true) {
    let content = [];
    let tableSort;

    if (ridesZipCodeReportResponse && this.ridesZipCodeReportTable) {
      tableSort = this.state.ridesZipCodeReport.tableSort;
      content = _.map(ridesZipCodeReportResponse.content, row =>
        this.ridesZipCodeReportTable.tableConfig.getDataMap(row));
    }

    return (
      <Panel header={<h4>Ride Statistics - {this.state.chartRangeTitle}</h4>}>
        <PaginatedTable
          ref={(ref) => { this.ridesZipCodeReportTable = ref; }}
          loading={ridesZipCodeReportLoading}
          data={content}
          serverResponse={ridesZipCodeReportResponse}
          defaultSort={tableSort}
          sortable={this.state.ridesZipCodeReport.sortableColumns}
          onSortChange={(e, data) => { this.handleTableChange({sortData: data, type: 'ridesZipCodeReport'}); }}
          onPageChange={(page) => { this.handleTableChange({page, type: 'ridesZipCodeReport'}); }}
        />
      </Panel>
    );
  }

  renderTrackingTable(ridesTrackingReportResponse, trackingReportLoading = true) {
    let content = [];
    let tableSort;

    if (ridesTrackingReportResponse && this.trackingReportTable) {
      tableSort = this.state.trackingReport.tableSort;
      content = _.map(ridesTrackingReportResponse.content, row =>
        this.trackingReportTable.tableConfig.getDataMap(row));
    }

    return (
      <Panel header={<h4>User Tracking Statistics - {this.state.chartRangeTitle}</h4>}>
        <PaginatedTable
          ref={(ref) => { this.trackingReportTable = ref; }}
          loading={trackingReportLoading}
          data={content}
          serverResponse={ridesTrackingReportResponse}
          defaultSort={tableSort}
          sortable={this.state.trackingReport.sortableColumns}
          onSortChange={(e, data) => { this.handleTableChange({sortData: data, type: 'trackingReport'}); }}
          onPageChange={(page) => { this.handleTableChange({page, type: 'trackingReport'}); }}
        />
      </Panel>
    );
  }

  render() {
    const {
      driversRidesReport,
      driversRidesReportLoading,
      ridesZipCodeReport,
      ridesZipCodeReportLoading,
      trackingReport,
      trackingReportLoading,
    } = this.props.statistics;
    return (
      <div className={styles.statistics}>
        <PropsWatcher prop="common.selectedCity" handler={() => this.handleLoad()} />
        {this.renderDashboard()}
        {this.renderChart()}
        {this.renderTrackingTable(trackingReport, trackingReportLoading)}
        {this.renderDriversRidesTable(driversRidesReport, driversRidesReportLoading)}
        {this.renderZipcodeTable(ridesZipCodeReport, ridesZipCodeReportLoading)}
      </div>
    );
  }
}

export default cssModules(Statistics, styles);

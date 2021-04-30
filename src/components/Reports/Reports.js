import React, { Component } from 'react';
import {
  Well,
  Form,
  FormGroup,
  ControlLabel,
  Button,
  ButtonToolbar,
  ButtonGroup,
  Row,
  Col,
  Modal,
} from 'react-bootstrap';
import Select from 'react-select';
import moment from 'moment';
import DatePick from 'react-datetime';
import Loader from 'react-loader';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-select/dist/react-select.css';

import CONSTANTS from '../../data/constants';
import exportCsv from '../../helpers/export-csv';
import {getTexasTime} from '../../helpers/common';
import {PaginatedTable} from '../';
import './Reports.scss';

import {
  Table,
  Tr,
  Td,
} from '../../lib/reactable';
import FormRenderer from '../common/FormRenderer';

const TimezoneConstants = CONSTANTS.timezone;

class Reports extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    reportFields: [],
  }

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedTimezone: getTexasTime(null, false).startOf('day').format('Z z'),
      texasOffset: TimezoneConstants.texas.offset,
      timezoneButton: 'texas',
      page: 0,
      filterType: 'COMPLETED',
      total: null,
      selectedZipCode: '',
      dayLightSavings: moment().isDST(),
      startDate: moment().utc().startOf('day').add(TimezoneConstants.texas.offset, 'hours'),
      endDate: moment().utc().endOf('day').add(TimezoneConstants.texas.offset, 'hours'),
      reportStartDate: getTexasTime(null, false).startOf('day'),
      reportEndDate: getTexasTime(null, false).endOf('day'),
      zipCodeOptions: [{value: 'n/a', label: 'n/a'}],
      reportFieldsError: {},
      showModal: false,
      sort: {
        column: 'u.firstName',
        direction: 1,
        desc: false,
      },
      pageSize: 100,
    };

    this.onZipCodeChange = this.onZipCodeChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onExportTotalToCSV = this.onExportTotalToCSV.bind(this);
    this.onExportDriversToCSV = this.onExportDriversToCSV.bind(this);
    this.onCityChange = this.onCityChange.bind(this);
    this.onReportStartDateChange = this.onReportStartDateChange.bind(this);
    this.onExecuteReport = this.onExecuteReport.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.handleChangeTimezone = this.handleChangeTimezone.bind(this);
    this.onReportEndDateChange = this.onReportEndDateChange.bind(this);
    this.onCustomReportChange = this.onCustomReportChange.bind(this);
    this.fetchReportParams = this.fetchReportParams.bind(this);
    this.onIsValidDate = this.onIsValidDate.bind(this);
  }

  componentWillMount() {
    this.refreshData();
  }

  componentWillReceiveProps(props) {
    if ('cumulativeRidesReport' in props) {
      this.total = null;
    }
  }

  onCityChange() {
    this.setState({page: 0}, this.refreshData);
  }

  onPageChange(page) {
    this.setState({page}, this.refreshRides);
  }

  onSortChange(e) {
    const sort = {
      column: this.tableRef.getSortPropertyByName(e.column),
      desc: e.direction === 1,
      type: e.sortType,
    };

    const tableSort = {
      direction: e.direction,
      column: e.column,
    };

    if (this.state.sort.column === sort.column && this.state.sort.desc) {
      sort.desc = false;
    } else {
      sort.desc = true;
    }

    this.setState({tableSort, sort}, this.refreshRides);
  }

  onReportStartDateChange(date) {
    if (this.state.reportStartDate.valueOf() === date.valueOf()) {
      return;
    }

    const filters = {
      page: 0,
      reportStartDate: date,
    };


    this.setState(filters, this.handleChangeTimezone);
  }

  onReportEndDateChange(date) {
    if (this.state.reportEndDate.valueOf() === date.valueOf()) {
      return;
    }

    const filters = {
      page: 0,
      reportEndDate: date,
    };

    this.setState(filters, this.handleChangeTimezone);
  }

  onChangeTimezone(tz) {
    if (tz !== this.state.timezoneButton) this.handleChangeTimezone(tz);
  }

  onCustomReportChange(report) {
    this.setState({
      selectedReport: report,
      loadingReportModal: true,
    }, this.fetchReportParams);
  }

  onZipCodeChange(zipCode) {
    this.setState({selectedZipCode: zipCode});
    this.refreshRides(zipCode);
  }

  onExportDriversToCSV() {
    const data = this.tableRef.getRenderedData();
    exportCsv({data, filename: 'export-drivers-earnings-csv.csv'});
  }

  onExportTotalToCSV() {
    const total = this.getTotal();
    const renderedData = total ? this.getTotalDataMap(total) : null;
    const data = [renderedData];
    exportCsv({data, filename: 'export-total-earnings-csv.csv'});
  }

  onIsValidDate(field, date) {
    const reportFields = this.props.reportFields;
    if (!moment(date).isBefore(moment())) {
      return false;
    }

    const fields = ['startDate', 'endDate', 'startDateTime', 'endDateTime'];
    let index = fields.indexOf(field.parameterName);
    if (index === -1) {
      return true;
    }
    index = index < 2 ? 0 : 2;

    const startDateField = reportFields.filter(r => r.parameterName === fields[index])[0];
    const endDateField = reportFields.filter(r => r.parameterName === fields[index + 1])[0];
    const endDate = field === endDateField ? moment() : (endDateField.value || moment());
    const startDate = field === endDateField ? (startDateField.value || moment(0)) : moment(0);
    return moment(date).isBetween(startDate, endDate);
  }

  onExecuteReport() {
    const emptyForm = this.props.reportFields.length === 0;
    const reportFieldsError =
      emptyForm ? { errorCount: 0 } : this.formRenderer.validateForm(true);
    if (reportFieldsError.errorCount) {
      return;
    }

    const parameters = {};

    this.props.reportFields.forEach((param) => {
      const key = param.parameterName;
      parameters[key] = param.value;
    });

    this.setState({loadingReportExecute: true});
    this.props.actions.executeReport(parameters, this.state.selectedReport.value)
    .then(() => {
      this.setState({
        loadingReportExecute: false,
        showModal: false,
      });
    });
  }

  getTotal() {
    if (this.total) {
      return this.total;
    }

    if (!this.props.cumulativeRidesReport) {
      return null;
    }

    let totalRides = 0;
    let totalMiles = 0;
    const averageMilesSum = 0;
    const averageFaresSum = 0;
    let totalFare = 0;
    let priorityFareRides = 0;
    const { ridesReport } = this.props.cumulativeRidesReport;

    if (ridesReport) {
      ridesReport.forEach(({
        ridesCount,
        distanceTraveledInMiles,
        totalFares,
        priorityFaresRidesCount,
      }) => {
        totalRides += ridesCount;
        totalMiles += distanceTraveledInMiles;
        totalFare += totalFares;
        priorityFareRides += priorityFaresRidesCount;
      });
    }

    const avgDistance = totalRides ? (totalMiles / totalRides) : 0;
    const avgFare = totalRides ? (totalFare / totalRides) : 0;
    this.total = {
      totalRides,
      totalMiles,
      averageMilesSum,
      averageFaresSum,
      totalFare,
      priorityFareRides,
      avgDistance,
      avgFare,
    };
    return this.total;
  }

  getTotalDataMap(total) {
    const {
      totalRides,
      totalMiles,
      totalFare,
      priorityFareRides,
      avgDistance,
      avgFare,
    } = total;

    const renderedData = {
      Date: `${this.state.reportStartDate.format('YYYY-MM-DD')} - ${this.state.reportEndDate.format('YYYY-MM-DD')}`,
      'Complete Rides': `${totalRides}`,
      'Priority Fare Rides': `${priorityFareRides}`,
      'Distance travelled': `${totalMiles.toFixed(2)} miles`,
      'Average distance': `${avgDistance.toFixed(2)}`,
      'Average fare': `$${avgFare.toFixed(2)}`,
      'Total fares': `$${totalFare.toFixed(2)}`,
    };

    return renderedData;
  }

  openModal() {
    this.setState({ showModal: true });
  }

  refreshData() {
    this.refreshRides();
    this.refreshZipCodes();
    this.refreshReports();
  }

  refreshRides(zipCode = null) {
    const params = {
      sort: this.state.sort.column,
      desc: this.state.sort.desc,
      page: this.state.page,
      pageSize: this.state.pageSize,
    };

    if (this.state.reportStartDate) {
      params.completedOnAfter = this.state.startDate.clone().toISOString();
      params.completedOnBefore = this.state.endDate.clone().toISOString();
    }

    if (zipCode) {
      params.zipCode = zipCode.value;
    }

    this.total = null;
    this.props.actions.getCumulativeRidesReport(params).then(
      () => {
        this.total = null;
      }
    );
  }

  refreshZipCodes() {
    const params = {
      sort: 'start.zipCode',
      desc: this.state.sort.desc,
      page: this.state.page,
      pageSize: this.state.pageSize,
    };

    if (this.state.reportStartDate) {
      params.completedOnAfter = this.state.startDate.clone().toISOString();
      params.completedOnBefore = this.state.endDate.clone().toISOString();
    }

    this.props.actions.getRidesCountReport(params);
  }

  refreshReports() {
    this.props.actions.getReports({});
  }

  closeModal() {
    this.setState({ showModal: false });
  }


  fetchReportParams() {
    this.props.actions.getReportParametrs({avatarType: 'ADMIN'}, this.state.selectedReport.value)
    .then(() => {
      this.setState({
        loadingReportModal: false,
      }, this.openModal);
    });
  }

  handleChangeTimezone(tz = this.state.timezoneButton) {
    let startDate;
    let endDate;

    const gmtStartDate =
      this.state.reportStartDate
        .clone()
        .utc()
        .add(this.state.reportStartDate.clone().utcOffset(), 'm');

    const gmtEndDate =
      this.state.reportEndDate
        .clone()
        .utc()
        .add(this.state.reportEndDate.clone().utcOffset(), 'm');

    const myStartDate =
      this.state.reportStartDate
        .clone()
        .utc()
        .add(this.state.reportStartDate.clone().utcOffset(), 'm')
        .subtract(moment().utcOffset(), 'm');

    const myEndDate =
      this.state.reportEndDate
        .clone()
        .utc()
        .add(this.state.reportEndDate.clone().utcOffset(), 'm')
        .subtract(moment().utcOffset(), 'm');

    if (tz === 'gmt') {
      startDate = gmtStartDate;
      endDate = gmtEndDate;
    } else if (tz === 'texas') {
      startDate = getTexasTime(this.state.reportStartDate.clone());
      endDate = getTexasTime(this.state.reportEndDate.clone());
    } else {
      startDate = myStartDate;
      endDate = myEndDate;
    }

    this.setState({
      page: 0,
      timezoneButton: tz,
      startDate,
      endDate,
    }, () => {
      this.refreshData();
    });
  }

  renderTotal() {
    const total = this.getTotal();
    if (this.props.loadingRidesReport || !total) {
      return null;
    }

    const renderedData = this.getTotalDataMap(total);

    return (<div className="table-responsive responsive-mobile">
      <Table className="table table-striped table-bordered table-condensed table-hover">
        <Tr>
          {Object.keys(renderedData).map(key =>
            <Td key={key} column={key}>{renderedData[key]}</Td>
          )}
        </Tr>
      </Table>
    </div>);
  }

  renderOtherReports() {
    return (<Well>
      <ControlLabel>Select Report</ControlLabel>
      <Select
        disabled={this.state.loadingReportModal}
        name="customreport"
        autosize={false}
        selected={this.state.selectedReport}
        placeholder="Select report..."
        options={this.props.availableReports}
        onChange={this.onCustomReportChange}
      />
    </Well>);
  }

  renderDriversRidesReport() {
    if (!this.props.cumulativeRidesReport || !this.props.cumulativeRidesReport.driversRidesReport) {
      return false;
    }

    const driversRidesReport = this.props.cumulativeRidesReport.driversRidesReport;
    const loadingRidesReport = this.props.loadingRidesReport;
    const tableSort = this.state.tableSort;
    return (
      <PaginatedTable
        autoRender
        ref={(ref) => { this.tableRef = ref; }}
        serverResponse={driversRidesReport}
        className={'driversRidesReport'}
        noDataText={'Could not find data.'}
        sortable={[
          {name: 'Driver name', property: ride => `${ride.firstName} ${ride.lastName}`, sort: 'u.firstName'},
          {name: 'Complete Rides', property: 'completedRides', sort: true},
          {name: 'Priority Fare Rides', property: 'priorityFareRides', sort: true},
          {name: 'Distance travelled', property: ride => `${ride.distanceTraveledInMiles} miles`, sort: 'distanceTraveledInMiles'},
          {name: 'Driver base pay', property: 'driverBasePayment', sort: true},
          {name: 'Driver tips', property: 'tips', sort: true},
          {name: 'Driver Priority fare increase', property: 'priorityFare', sort: true},
          {name: 'Cancellation fee', property: 'cancellationFee', sort: true, defaultValue: ''},
          {name: 'Total Driver Earnings', property: data => _.round(data.driverPayment, 2), sort: 'driverPayment'},
          {name: 'RA Gross margin', property: 'raGrossMargin', sort: true},
          {name: 'Total fares', property: data => _.round(data.totalFare, 2), sort: 'totalFare'},
        ]}
        defaultSort={tableSort}
        onSortChange={this.onSortChange}
        onPageChange={this.onPageChange}
        loading={loadingRidesReport}
      />
    );
  }

  renderCustomReportModal() {
    const emptyForm = this.props.reportFields.length === 0;
    return (
      <Loader loaded={!this.state.loadingReportExecute}>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>Report </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <div id="dynamicInput">
                { emptyForm &&
                  <p>Do you want to send the report?</p>
                }
                { !emptyForm &&
                  <FormRenderer
                    fields={this.props.reportFields}
                    onIsValidDate={this.onIsValidDate}
                    ref={(ref) => { this.formRenderer = ref; }}
                  />
                }
              </div>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.closeModal}>{emptyForm ? 'No' : 'Cancel'}</Button>
            <Button onClick={this.onExecuteReport} bsStyle="primary" >{emptyForm ? 'Yes' : 'Send'}</Button>
          </Modal.Footer>
        </Modal>
      </Loader>
    );
  }

  render() {
    return (
      <div className="reports">
        { this.renderOtherReports() }
        <h4>View earnings</h4>
        <Well>
          <Form inline>
            <Row>
              <Col xs={12} sm={2}>
                <FormGroup className="width100p">
                  <ControlLabel>Start Date</ControlLabel>
                  <DatePick
                    isValidDate={date => moment(date).isBefore(this.state.reportEndDate)}
                    className="width100p"
                    dateFormat="YYYY-MM-DD"
                    defaultValue={this.state.reportStartDate}
                    onBlur={this.onReportStartDateChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={2}>
                <FormGroup className="width100p">
                  <ControlLabel>End Date</ControlLabel>
                  <DatePick
                    isValidDate={
                      date => moment(date).isBetween(this.state.reportStartDate, moment())}
                    className="width100p"
                    dateFormat="YYYY-MM-DD"
                    defaultValue={this.state.reportEndDate}
                    onBlur={this.onReportEndDateChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={4} className="timezone-actions">
                <FormGroup>
                  <ButtonToolbar>
                    <ButtonGroup justified>
                      <Button
                        href="#"
                        bsStyle={this.state.timezoneButton === 'mine' ? 'primary' : 'default'}
                        onClick={() => this.onChangeTimezone('mine')}
                      >My timezone</Button>
                      <Button
                        href="#"
                        bsStyle={this.state.timezoneButton === 'gmt' ? 'primary' : 'default'}
                        onClick={() => this.onChangeTimezone('gmt')}
                      >GMT+0</Button>
                      <Button
                        href="#"
                        bsStyle={this.state.timezoneButton === 'texas' ? 'primary' : 'default'}
                        onClick={() => this.onChangeTimezone('texas')}
                      >Texas</Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </FormGroup>
              </Col>

              <Col xs={12} sm={2} className="zipcode-select">
                <FormGroup>
                  <Select
                    name="zipcode"
                    value={this.state.selectedZipCode}
                    autosize={false}
                    placeholder="Zipcode"
                    options={this.props.zipCodeOptions}
                    onChange={this.onZipCodeChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={6} sm={2} className="total-csv-btn">
                <FormGroup>
                  <ButtonToolbar className="text-right">
                    <Button onClick={this.onExportTotalToCSV}>Total CSV</Button>
                    <Button onClick={this.onExportDriversToCSV}>Drivers CSV</Button>
                  </ButtonToolbar>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </Well>

        { this.renderTotal() }
        { this.renderDriversRidesReport() }
        { this.renderCustomReportModal() }
      </div>
    );
  }
}

export default Reports;

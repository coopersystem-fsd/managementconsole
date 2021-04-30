import React, { Component } from 'react';
import {
  Col,
  Well,
  Row,
  ButtonToolbar,
  Button,
  Modal,
  Label,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import {PaginatedTable} from '../';
import styles from './Payments.scss';
import PropsWatcher from '../../containers/PropsWatcher';
import FormField from '../common/FormField';
import constants from '../../data/constants';
import {getTexasTime} from '../../helpers/common';
import NewPaymentModal from './NewPaymentModal';
import ExportPaymentsModal from './ExportPaymentsModal';

class Payments extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      sort: 'id',
      desc: true,
      pageSize: 100,
      serverResponse: {
        content: [],
      },
      cityId: this.props.selectedCity,
      loading: true,
      filters: constants.payments.slice(),
      sortable: [
        { name: 'Category', property: 'category', sort: true },
        { name: 'Creator Email', property: 'creatorEmail', sort: 'creator.user.email' },
        { name: 'Creator Name', property: ({creatorFirstName, creatorLastName}) => `${creatorFirstName} ${creatorLastName}`, sort: 'creator.user.firstname' },
        { name: 'Creator ID', property: 'creatorId', sort: 'creator.id' },
        { name: 'Driver Name', property: ({driverFirstName, driverLastName}) => `${driverFirstName} ${driverLastName}`, sort: 'driver.user.firstname' },
        { name: 'Driver ID', property: 'driverId', sort: 'driver.id' },
        { name: 'Description', property: 'description', sort: true },
      ],
    };

    this.onExportFieldValueChange = this.onExportFieldValueChange.bind(this);
  }

  componentDidMount() {
    if (_.get(this.props, 'params.id')) {
      this.replaceFilter({newValue: 'driverId', filter: {id: 'searchBy'}});
      this.replaceFilter({newValue: this.props.params.id, filter: {id: 'query'}});
    } else {
      this.handleLoad();
    }
    this.handleLoadDebounced = _.debounce(this.handleLoad, 500);
  }

  onExportFieldValueChange(field, fields) {
    const afterField = _.find(fields, {id: 'createAfter'});
    const beforeField = _.find(fields, {id: 'createBefore'});
    const dateField = _.find(fields, {id: 'paymentDate'});
    afterField.props = {
      maxDate: beforeField.value,
    };
    beforeField.props = {
      minDate: afterField.value,
    };
    dateField.props = {
      minDate: afterField.value,
      maxDate: beforeField.value,
    };
  }

  getPrettyFilters(filters) {
    return _.map(this.getFilterParams(filters), (v, k) => {
      const filter = _.find(filters, {id: k});
      if (!filter && v) {
        return { name: k, values: v };
      } else if (!filter && !v) {
        return false;
      } else if (filter && moment.isMoment(filter.value)) {
        return { name: filter.name, values: filter.value.format('YYYY-MM-DD') };
      }
      return { name: filter.name, values: v };
    }).filter(Boolean);
  }

  getFilterParams(filters) {
    const params = {};
    let searchBy;
    _.chain(filters)
      .filter()
      .forEach((filter) => {
        if (filter.id === 'searchBy') {
          searchBy = filter.value;
        } else if (filter.id === 'query' && filter.value !== '') {
          params[searchBy] = filter.value;
        } else if (moment.isMoment(filter.value)) {
          params[filter.id] = getTexasTime(filter.value).toISOString();
        } else if (filter.value && filter.value !== '' && filter.value !== 'all') {
          params[filter.id] = filter.value;
        }
      })
      .value();

    return params;
  }

  mapUsers(content) {
    return this.table ? _.map(content, row => this.table.tableConfig.getDataMap(row)) : null;
  }

  replaceFilter({newValue, filter}) {
    const filters = this.state.filters.slice();
    const filterIndex = _.findIndex(filters, {id: filter.id});
    filters[filterIndex].value = newValue;
    if (filter.id === 'createdOnAfter' && moment.isMoment(newValue)) newValue.startOf('day');
    if (filter.id === 'createdOnBefore' && moment.isMoment(newValue)) newValue.endOf('day');
    this.setState({filters, page: 0}, () => {
      if (filter.id === 'searchBy') {
        return false;
      } else if (filter.id === 'query') {
        return this.handleLoadDebounced();
      }
      return this.handleLoad();
    });
  }

  handleLoad(id) {
    const filterParams = this.getFilterParams(this.state.filters);
    const {page, desc, sort, pageSize, cityId} = this.state;
    const params = Object.assign({}, filterParams, {page, desc, sort, cityId, pageSize});
    if (cityId === '*') delete params.cityId;
    if (id) params.driverId = id;
    this.setState({loading: true});
    this.props.actions.listPayments(params)
      .then(({payload: {serverResponse, error}}) => {
        const state = { loading: false };
        if (!error) {
          state.serverResponse = serverResponse;
          state.data = this.mapUsers(serverResponse.content);
        }
        this.setState(state);
      });
  }

  renderDashboard() {
    return (
      <Well className="clearfix" bsSize="small">
        {_.map(this.state.filters, (filter) => {
          filter.className = 'bottom0';
          return (
            <Col key={filter.id} sm={filter.sm || 2}>
              <Row>
                <FormField
                  field={filter}
                  onChange={newValue => this.replaceFilter({newValue, filter})}
                />
              </Row>
            </Col>
          );
        })
        }
        <Col sm={4} className="top15 pull-right">
          <ButtonToolbar className="pull-right">
            <Button onClick={() => this.setState({showNewPaymentModal: true})}>New Payment</Button>
            <Button onClick={() => this.setState({showExportModal: true})}>Export CSV</Button>
          </ButtonToolbar>
        </Col>
      </Well>
    );
  }

  renderTable({ serverResponse, loading, tableSort, data, sortable } = this.state) {
    return (
      <PaginatedTable
        className={'payments-table'}
        ref={(ref) => { this.table = ref; }}
        serverResponse={serverResponse}
        data={data}
        loading={loading}
        sortable={sortable}
        onSortChange={(a, e) =>
          this.setState({
            tableSort: e.tableSort,
            sort: e.sort.column,
            desc: e.sort.desc,
          }, this.handleLoad)}
        onPageChange={page => this.setState({page}, this.handleLoad)}
        defaultSort={tableSort}
      />
    );
  }

  renderExportCSVModal() {
    if (this.state.exportCSV) {
      const filters = this.getPrettyFilters(this.state.filters);
      const user = this.props.login.user;
      return (
        <Modal backdrop={'static'} show={!!this.state.exportCSV}>
          <Modal.Header>
            <Modal.Title>Send Export</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Export will be sent to email: <Label>{user.email}</Label>
            {filters.length > 0 &&
              <div className="top15">Applied filters:</div>
            }
            <ul>
              {_.map(filters, filter => <li><strong>{filter.name}:</strong> {filter.values}</li>)}
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button
              disabled={this.state.sendingExport}
              onClick={() => this.setState({exportCSV: null})}
            >Cancel</Button>
            <Button
              disabled={this.state.sendingExport}
              onClick={() => {
                this.setState({sendingExport: true});
                this.props.actions.exportDrivers(
                  Object.assign({},
                    this.getFilterParams(this.state.filters),
                    { cityId: this.state.cityId }))
                .then(() => {
                  this.setState({exportCSV: null, sendingExport: false});
                });
              }}
              bsStyle="primary"
            >{this.state.sendingExport ? 'Sending...' : 'Send Export'}</Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return false;
  }

  render() {
    return (
      <div className="payments clearfix row">
        <PropsWatcher prop="common.selectedCity" handler={cityId => this.setState({cityId, page: 0}, this.handleLoad)} />
        {this.renderDashboard()}
        {this.renderTable()}
        <NewPaymentModal
          show={this.state.showNewPaymentModal}
          onClose={reload => this.setState({showNewPaymentModal: false}, () => {
            if (reload) this.handleLoad();
          })}
          onChange={newPayment => this.props.actions.addPayments(newPayment)}
        />
        <ExportPaymentsModal
          user={this.props.login.user}
          show={this.state.showExportModal}
          onFieldValueChange={this.onExportFieldValueChange}
          fields={{
            createAfter: _.find(this.state.filters.slice(), {id: 'createdOnAfter'}),
            createBefore: _.find(this.state.filters.slice(), {id: 'createdOnBefore'}),
            paymentDate: _.find(this.state.filters.slice(), {id: 'paymentDate'}),
          }}
          onClose={reload => this.setState({showExportModal: false}, () => {
            if (reload) this.handleLoad();
          })}
          onChange={params => this.props.actions.exportPayments(params)}
        />
        {this.renderExportCSVModal()}
      </div>
    );
  }
}

export default cssModules(Payments, styles);

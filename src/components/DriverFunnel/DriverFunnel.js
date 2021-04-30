import React, { Component } from 'react';
import {
  DropdownButton,
  Button,
  MenuItem,
  Col,
  Well,
  Row,
  ButtonGroup,
  Modal,
  FormControl,
  Form,
  InputGroup,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import {PaginatedTable, OnboardingDetailModal} from '../';
import Loading from '../Loading';
import styles from './DriverFunnel.scss';
import constants from '../../data/constants';
import PropsWatcher from '../../containers/PropsWatcher';
import Options from './Options';

import ExportModal from './ExportModal';
import TableRowSelect from './TableRowSelect';
import Filters from './Filters';
import UserHistoryContainer from '../../containers/UserHistoryContainer';

class DriverFunnel extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      sort: 'id',
      desc: true,
      cityId: 1,
      changelog: null,
      exportCSV: null,
      query: '',
      selectedSearchType: 'name',
      sortable: [
        { name: 'Driver ID', property: 'driverId', sort: 'id' },
        { name: 'Name', property: ({firstName, lastName}) => `${firstName} ${lastName}`, sort: 'user.firstname' },
        { name: 'Onboarding Status', property: 'onboardingStatus', sort: true },
        { name: 'Activation Status', property: 'activationStatus', sort: true },
        { name: 'CheckR', property: 'checkrStatus', sort: true },
        { name: 'Payoneer', property: 'payoneerStatus', sort: true },
        { name: 'City Approval', property: 'cityApprovalStatus', sort: true },
        { name: 'Car Registration', property: 'carInspectionStatus', sort: true },
        { name: 'Driver License', property: 'driverLicenseStatus', sort: true },
        { name: 'Insurance', property: 'insuranceStatus', sort: true },
        { name: 'Car Photos', property: 'carPhotosStatus', sort: true },
        { name: 'Profile Photos', property: 'profilePhotosStatus', sort: true },
        { name: 'Registration Sticker', property: 'inspectionStickerStatus', sort: true },
        { name: '', property: 'actions', sort: false },
      ],
      funnel: [],
      users: [],
    };

    this.handleOnClickEvent = ({target}) => {
      const elClassName = target.className.indexOf('table-row-select') > -1;
      const parentClassName = target.parentElement ? target.parentElement.className.indexOf('table-row-select') > -1 : false;
      if (!elClassName && !parentClassName && this.state.options) {
        this.setState({options: false});
      }
    };
  }

  componentDidMount() {
    this.onInit();
    document.addEventListener('click', this.handleOnClickEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOnClickEvent);
  }

  onInit() {
    const filters = _.map(constants.driverFunnel.filters, (filter) => {
      filter.default = filter.selected.slice();
      filter.options = _.map(filter.options, (option) => {
        const color = _.find(constants.driverFunnel.colorMap, {name: option.name});
        if (color) option.color = color.color;
        return option;
      });
      return filter;
    });
    this.setState({filters, cityId: this.props.common.selectedCity}, this.handleLoad);
  }

  onSearchSubmit(e) {
    e.preventDefault();
    const query = e.target[0].value;
    this.setState({query, page: 0}, () => this.handleLoad());
  }

  onTableRowSelect({option, filter, id, car, carPhotosStatus} = {}) {
    if (option && filter && id) {
      const users = this.props.driverFunnel.users.slice();
      const user = _.find(users, {driverId: _.toNumber(id)});
      const userIndex = _.findIndex(users, {driverId: _.toNumber(id)});

      let newCar;
      if (car && carPhotosStatus) {
        const carIndex = _.findIndex(user.cars, {id: car.id});
        user.cars[carIndex].carPhotosStatus[carPhotosStatus] = option.id;
        newCar = user.cars[carIndex];
      } else if (car) {
        const carIndex = _.findIndex(user.cars, {id: car.id});
        const carKey = this.mapFilterToCarObject(filter.id);
        user.cars[carIndex][carKey] = option.id;
        newCar = user.cars[carIndex];
      } else {
        user[filter.id] = option.id;
      }

      users[userIndex] = user;

      this.props.actions.update({users});
      this.handleTableRowSelect({user, option, filter, car: newCar, carPhotosStatus});
      this.setState({options: null});
    }

    return false;
  }

  onFunnelClick(id) {
    const filters = this.state.filters.slice();
    const newFilters = this.getFilterGroup({filters, id});
    this.setState({filters: newFilters, page: 0}, this.handleLoad);
  }

  onExportButtonClick() {
    this.setState({ exportCSV: true });
  }

  onChangelogButtonClick(row) {
    this.setState({changelog: row});
  }

  getUpdateDriverDocumentParams({filterId, newStatus, user, newStatusName}) {
    const types = [
      { type: 'LICENSE', id: 'driverLicenseStatus', name: 'Driver License' },
      { type: 'INSURANCE', id: 'insuranceStatus', name: 'Insurance' },
      { type: 'PHOTO', id: 'profilePhotosStatus', name: 'Profile Photo' },
      { type: 'CAR_STICKER', id: 'inspectionStickerStatus', name: 'Registration Sticker' },
      { type: 'TNC_CARD', id: 'cityApprovalStatus', name: 'TNC Card' },
    ];
    const statusMap = {
      PENDING: 'PENDING',
      NOT_PROVIDED: 'PENDING',
      NOT_REQUESTED: 'PENDING',
      EXPIRED: 'EXPIRED',
      REJECTED_PHOTO: 'REJECTED',
      REJECTED_BY_CITY: 'REJECTED',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    };
    const type = _.find(types, {id: filterId});
    if (type) {
      const params = Object.assign({}, {
        user,
        type: type.type,
        cityId: this.state.cityId,
        newStatus: statusMap[newStatus],
        status: {
          name: type.name,
          value: newStatusName,
        },
      });
      return params;
    }
    return false;
  }

  getFilterGroup({filters, id, clearFilter}) {
    if (clearFilter && id) {
      const filterIndex = _.findIndex(filters, {id});
      filters[filterIndex].selected = filters[filterIndex].default;
      return filters;
    } else if (id) {
      const selectedFilter = _.find(filters, {id});
      return _.map(filters, (filter) => {
        const newSelected = _.filter(filter.options, ({id: optionId}) => { // eslint-disable-line
          if (selectedFilter && selectedFilter.pending) {
            return selectedFilter.pending.indexOf(optionId) > -1;
          }
        });

        filter.selected = newSelected;
        if (filter.id !== selectedFilter.id) filter.selected = [_.find(filter.options, ({id: '*'}))];
        return filter;
      });
    }
    return _.map(filters, (filter) => {
      filter.selected = filter.default;
      return filter;
    });
  }

  getPrettyFilters(filters) {
    return _.map(this.getFilterParams(filters), (v, k) => {
      const filter = _.find(filters, {id: k});
      const values =
        _.chain(v)
          .split(',')
          .map(value => _.find(filter.options, {id: value}).name)
          .join(', ')
          .value();
      return { name: filter.name, values };
    });
  }

  getFilterParams(filters) {
    const params = {};
    _.chain(filters)
      .filter(({showInDashboard}) => showInDashboard)
      .forEach((filter) => {
        const param =
          _.chain(filter.selected)
            .filter(({id}) => id !== '*')
            .map(({id}) => id)
            .join(',')
            .value();

        if (param !== '') params[filter.id] = param;
      }).value();

    return params;
  }

  mapFilterToCarObject(filterId) {
    const carObject = {
      carInspectionStatus: 'inspectionStatus',
      insuranceStatus: 'insuranceStatus',
      inspectionStickerStatus: 'inspectionStickerStatus',
    };
    return carObject[filterId];
  }

  mapUsers(users, table) {
    const filters = this.state.filters.slice();
    return _.chain(users)
      .map((row) => {
        const mappedRow = Object.assign({}, row);
        mappedRow.driverId = (
          <Button
            bsStyle={'link'}
            onClick={() => this.setState({selected: row})}
          >{row.driverId}</Button>
        );

        const selects = [
          'onboardingStatus',
          'activationStatus',
          'checkrStatus',
          'payoneerStatus',
          'cityApprovalStatus',
          'profilePhotosStatus',
          'driverLicenseStatus',
          'carPhotosStatus',
          'profilePhotosStatus',
        ];

        _.forEach(row, (v, k) => {
          if (selects.indexOf(k) > -1) {
            mappedRow[k] = (
              <TableRowSelect
                type={v}
                filter={_.find(filters, {id: k})}
                id={row.driverId}
                disabled={['payoneerStatus', 'onboardingStatus'].indexOf(k) > -1}
                onChange={options => this.setState({options})}
              />
            );
          }
        });

        const carSelects = [
          { filterId: 'carInspectionStatus', type: 'inspectionStatus' },
          { filterId: 'insuranceStatus', type: 'insuranceStatus' },
          { filterId: 'carPhotosStatus', type: 'carPhotosStatus' },
          { filterId: 'inspectionStickerStatus', type: 'inspectionStickerStatus' },
        ];

        _.forEach(carSelects, ({filterId, type}) => {
          const isCarPhotosStatus = filterId === 'carPhotosStatus';
          mappedRow[filterId] = (
            <div>
              {
                _.chain(row.cars)
                  .filter(({removed}) => !removed)
                  .map((car) => {
                    if (car[type]) {
                      return (
                        <div key={car.id} className="car-select-group">
                          <div>
                            {isCarPhotosStatus &&
                              _.map(car[type], (v, k) => {
                                if (v) {
                                  return (
                                    <div key={`${car.id}-${k}`} className="car-select">
                                      <div className="">
                                        <TableRowSelect
                                          type={v}
                                          filter={_.find(filters, {id: filterId})}
                                          id={row.driverId}
                                          car={car}
                                          carPhotosStatus={k}
                                          onChange={options => this.setState({options})}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                                return false;
                              }
                              )
                            }
                            {!isCarPhotosStatus &&
                              <TableRowSelect
                                type={car[type]}
                                filter={_.find(filters, {id: filterId})}
                                id={row.driverId}
                                car={car}
                                onChange={options => this.setState({options})}
                              />
                            }
                          </div>
                        </div>
                      );
                    }
                    return false;
                  })
                  .value()
              }
            </div>
          );
        });

        mappedRow.actions = this.renderTableRowActions(row);
        console.log('row', table.tableConfig.getDataMap(mappedRow));
        return table.tableConfig.getDataMap(mappedRow);
      })
      .value();
  }

  handleTableRowSelect({user, option, filter, car, carPhotosStatus: documentType}) {
    const handleError = ({payload}) => {
      if (payload.error) {
        this.handleLoad();
      } else {
        this.handleLoad(true);
      }
    };

    const documentStatuses = [
      'driverLicenseStatus',
      'profilePhotosStatus',
    ];

    const driverStatuses = [
      'onboardingStatus',
      'activationStatus',
      'checkrStatus',
      'cityApprovalStatus',
    ];

    const carStatuses = [
      'carInspectionStatus',
    ];

    const carDocumentStatuses = [
      'carPhotosStatus',
      'inspectionStickerStatus',
      'insuranceStatus',
    ];

    if (carStatuses.indexOf(filter.id) > -1 && car) {
      this.props.actions.updateCarStatus({
        user,
        car,
        statusName: filter.name,
        statusValue: option.name,
        cityId: this.state.cityId,
      }).then(handleError);
    }

    if (carDocumentStatuses.indexOf(filter.id) > -1 && car) {
      let params = {};

      if (filter.id === 'carPhotosStatus') {
        car.carPhotosStatus[documentType] = option.id;
        params.statusName = filter.name;
        params.type = documentType;
      }

      if (filter.id === 'inspectionStickerStatus' || filter.id === 'insuranceStatus') {
        params = this.getUpdateDriverDocumentParams({
          filterId: filter.id,
          newStatus: option.id,
          newStatusName: option.name,
          user,
        });
        params.statusName = params.status.name;
      }

      params.filter = filter;
      params.statusValue = option.id;
      params.cityId = this.state.cityId;
      params.user = user;
      params.car = car;

      this.props.actions.updateCarDocumentStatus(params).then(handleError);
    }

    if (driverStatuses.indexOf(filter.id) > -1) {
      this.props.actions.updateDriver({
        status: {[filter.id]: option.id},
        statusName: filter.name,
        statusValue: option.name,
        user,
        car,
        cityId: this.state.cityId,
      }).then(handleError);
    }

    if (documentStatuses.indexOf(filter.id) > -1) {
      const params = this.getUpdateDriverDocumentParams({
        filterId: filter.id,
        newStatus: option.id,
        newStatusName: option.name,
        user,
      });
      this.props.actions.updateDriverDocument(params)
        .then(handleError);
    }
  }

  handleLoad(silent) {
    const filterParams = this.getFilterParams(this.state.filters);
    const {page, desc, sort, cityId, direction, query, selectedSearchType} = this.state;
    const params = Object.assign({}, filterParams, {page, desc, sort, cityId, silent});
    if (query !== '') params[selectedSearchType] = query;
    if (cityId === '*') delete params.cityId;
    if (!silent) this.setState({loading: true});

    this.props.actions.listUsers(params)
      .then(() => {
        let selected;
        if (direction === 'next' || direction === 'first') {
          selected = _.first(this.props.driverFunnel.users);
        }
        if (direction === 'prev' || direction === 'last') {
          selected = _.last(this.props.driverFunnel.users);
        }
        this.setState({ selected, direction: null });
      });
  }

  renderSearchField() {
    const searchTypes = _.map(constants.users.searchTypes, (type) => {
      const t = Object.assign({}, type);
      if (t.value === 'id') t.value = 'driverId';
      return t;
    });
    const searchType = _.find(searchTypes, {value: this.state.selectedSearchType});
    return (
      <Col xs={12} sm={6} lg={4} className="top15 leftp5 rightp5">
        <Form className="search" onSubmit={e => this.onSearchSubmit(e)}>
          <InputGroup>
            <FormControl
              ref={(ref) => {
                this.query = ref;
              }}
              type="text"
              defaultValue={this.state.query}
              placeholder={`Search By ${searchType.name}...`}
            />
            <DropdownButton
              componentClass={InputGroup.Button}
              id="input-dropdown-addon"
              title={searchType.name}
            >
              {searchTypes.map(type => (
                <MenuItem
                  key={type.value}
                  eventKey={type.value}
                  onSelect={() => this.setState({selectedSearchType: type.value})}
                >
                  {type.name}
                </MenuItem>
              ))
              }
            </DropdownButton>
          </InputGroup>
        </Form>
      </Col>
    );
  }

  renderExportButton() {
    return (
      <Col xs={12} sm={3} lg={2} className="top15 pull-right leftp5 rightp5">
        <Button
          block
          onClick={() => this.onExportButtonClick()}
        >Export CSV</Button>
      </Col>
    );
  }

  renderResetFiltersButton() {
    return (
      <Col xs={12} sm={3} lg={2} className="top15 pull-right leftp5 rightp5">
        <Button
          block
          onClick={() => {
            const filters = this.state.filters.slice();
            const newFilters = this.getFilterGroup({filters});
            this.query.value = '';
            this.setState({filters: newFilters, page: 0, query: ''}, this.handleLoad);
          }}
        >Reset Filters</Button>
      </Col>
    );
  }

  renderDashboard() {
    return (
      <Well className="clearfix" bsSize="small">
        {_.chain(this.state.filters)
        .filter(({showInDashboard}) => showInDashboard)
        .filter(({city = []}) => {
          if (city.length > 0 && this.state.cityId) {
            return city.indexOf(this.state.cityId) > -1;
          }
          return true;
        })
        .map(filter =>
          <Filters
            filter={filter}
            filters={this.state.filters}
            cityId={this.state.cityId}
            funnel={this.props.driverFunnel.funnel}
            onChange={(filters) => {
              this.setState({filters, page: 0}, this.handleLoad);
            }}
          />
        )
        .value()}

        <Row>
          <Col sm={12}>
            {this.renderExportButton()}
            {this.renderResetFiltersButton()}
            {this.renderSearchField()}
          </Col>
        </Row>
      </Well>
    );
  }

  renderFunnel() {
    if (this.props.driverFunnel.funnel.length > 0) {
      return (
        <Row className="funnel">
          {_.map(this.props.driverFunnel.funnel, ({name, color, users, id}) =>
            <Col key={id} xs={3} sm={12}>
              <div style={{background: color}} className={'funnel-stack'}>
                <a
                  href=""
                  onClick={(e) => {
                    this.onFunnelClick(id);
                    e.preventDefault();
                  }}
                >
                  <div className="funnel-text-wrapper">
                    <div>{name}</div>
                    <div>{users}</div>
                  </div>
                </a>
              </div>
            </Col>)}
        </Row>
      );
    }
    return <Loading loading={this.state.loading} />;
  }

  renderTableRowActions(row) {
    return (
      <ButtonGroup bsSize="xsmall">
        <Button block bsStyle={'primary'} onClick={() => this.onChangelogButtonClick(row)}>Log</Button>
      </ButtonGroup>
    );
  }

  renderTable() {
    return (
      <PaginatedTable
        className={'driver-funnel-table'}
        ref={(ref) => { this.table = ref; }}
        serverResponse={this.props.driverFunnel.serverResponse}
        data={this.table ? this.mapUsers(this.props.driverFunnel.users, this.table) : []}
        loading={this.props.driverFunnel.loading}
        sortable={this.state.sortable}
        onSortChange={(a, e) =>
          this.setState({
            tableSort: e.tableSort,
            sort: e.sort.column,
            desc: e.sort.desc,
          }, this.handleLoad)}
        onPageChange={page => this.setState({page}, this.handleLoad)}
        defaultSort={this.state.tableSort}
      />
    );
  }

  renderChangeLogModal() {
    if (this.state.changelog) {
      const user = this.state.changelog;
      return (
        <Modal
          bsSize={'lg'}
          className="changelog"
          show={!!this.state.changelog}
          onHide={() => this.setState({changelog: null})}
        >
          <Modal.Header closeButton>
            <Modal.Title>Changelog</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <UserHistoryContainer
              driverId={user.driverId}
              ref={(ref) => { this.userHistory = ref; }}
            />
          </Modal.Body>
        </Modal>
      );
    }
    return false;
  }

  renderExportCSVModal() {
    if (this.state.exportCSV) {
      return (
        <ExportModal
          filters={this.getPrettyFilters(this.state.filters)}
          show={this.state.exportCSV}
          user={this.props.login.user}
          sendingExport={this.state.sendingExport}
          onCancel={() => this.setState({exportCSV: null})}
          onSend={() => {
            this.setState({sendingExport: true});
            this.props.actions.exportDrivers(
              Object.assign({},
                this.getFilterParams(this.state.filters),
                {cityId: this.props.common.selectedCity}))
            .then(() => {
              this.setState({exportCSV: null, sendingExport: false});
            });
          }}
        />
      );
    }
    return false;
  }

  renderOnboardingDetailModal() {
    if (this.state.selected) {
      return (
        <OnboardingDetailModal
          loading={this.props.driverFunnel.loading}
          userProps={this.props.user}
          actions={this.props.actions}
          userActions={this.props.userActions}
          common={this.props.common}
          city={_.find(this.props.common.cities, {id: this.state.cityId})}
          currentUser={this.props.login.user}
          show={!!this.state.selected}
          user={this.state.selected}
          onboarding={this.props.user.onboarding}
          serverResponse={this.props.driverFunnel.serverResponse}
          type="drivers"
          onClose={userHasChanged => this.setState({selected: null}, () => {
            if (userHasChanged) this.handleLoad();
          })}
          onChangeUser={({selected, direction}) => {
            if (direction === 'last') {
              // get last user
              const lastPage = this.props.driverFunnel.serverResponse.totalPages - 1;
              this.setState({page: lastPage, direction}, this.handleLoad);
            } else if (direction === 'first') {
              // get first user
              this.setState({page: 0, direction}, this.handleLoad);
            } else {
              this.setState({selected});
            }
          }}
          onChangePage={({page, direction}) => this.setState({page, direction}, this.handleLoad)}
        />
      );
    }
    return false;
  }

  render() {
    return (
      <div className="driverFunnel clearfix row">
        <PropsWatcher prop="common.selectedCity" handler={cityId => this.setState({cityId, page: 0}, this.handleLoad)} />
        <Col sm={1} className="rightp5 leftp5">{this.renderFunnel()}</Col>
        <Col sm={11}>
          {this.renderDashboard()}
          {this.renderTable()}
          {this.renderChangeLogModal()}
          {this.renderExportCSVModal()}
          {this.renderOnboardingDetailModal()}
          {this.state.options &&
            <Options {...this.state.options} onChange={e => this.onTableRowSelect(e)} />}
        </Col>
      </div>
    );
  }
}

export default cssModules(DriverFunnel, styles);

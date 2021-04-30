import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import { Link } from 'react-router';
import {
  ButtonToolbar,
  Button,
  Well,
  Form,
  DropdownButton,
  FormControl,
  InputGroup,
  MenuItem,
  Col,
  Row,
} from 'react-bootstrap';
import styles from './Users.scss';
import ExportModal from './ExportModal';
import PaginatedTable from '../PaginatedTable';
import PropsWatcher from '../../containers/PropsWatcher';
import { SelectFilter } from '../common';
import constants from '../../data/constants';
import { getMultipleSelectValues } from '../../helpers/common';


import Loading from '../Loading';

class Users extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
  }

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);

    this.onExportToCSV = this.onExportToCSV.bind(this);
    this.onCarTypesChange = this.onCarTypesChange.bind(this);
    this.onUserTypeChange = this.onUserTypeChange.bind(this);
    this.onUserStatusChange = this.onUserStatusChange.bind(this);
    this.onCheckrStatusChange = this.onCheckrStatusChange.bind(this);
    this.onPayoneerStatusChange = this.onPayoneerStatusChange.bind(this);
    this.onInspectionStatusChange = this.onInspectionStatusChange.bind(this);
    this.onSelectSearchType = this.onSelectSearchType.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onClearFilters = this.onClearFilters.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.renderFilters = this.renderFilters.bind(this);
    this.getActionButtons = this.getActionButtons.bind(this);
    this.processUsers = this.processUsers.bind(this);
    this.onPaginationClick = this.onPaginationClick.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.getActiveOrEnabled = this.getActiveOrEnabled.bind(this);
    this.sendDriverData = this.sendDriverData.bind(this);
    this.sendRidersData = this.sendRidersData.bind(this);
    this.sendUserData = this.sendUserData.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.onWomenOnlyClick = this.onWomenOnlyClick.bind(this);
    this.onCityChange = this.onCityChange.bind(this);
    this.onPayoneerStatusRefresh = this.onPayoneerStatusRefresh.bind(this);
    this.state = {
      loading: true,
      sort: {
        column: 'id',
        desc: true,
      },
      data: null,
      showMap: false,
      paginatedUsers: null,
      queryChanged: false,
      activePage: 0,
      query: '',
      selectedStatus: 'all',
      selectedSearchType: 'name',
      selectedUserType: 'drivers',
      selectedCarType: '*',
      selectedCheckrStatus: '*',
      selectedPayoneerStatus: '*',
      selectedInspectionStatus: '*',
      showModal: false,
      pageSize: 100,
    };
  }

  componentWillMount() {
    if (this.props.usersListData) {
      const {params, filters} = this.props.usersListData;
      this.setState({
        loading: false,
        queryChanged: false,
        activePage: params.page,
        ...filters,
      }, () => this.getUsers());
    } else {
      this.getUsers();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.usersListData !== this.props.usersListData) {
      this.processUsers(nextProps.usersListData);
    }
  }

  onClearFilters() {
    const filters = {loading: true};
    [
      'selectedStatus',
      'selectedCarType',
      'selectedCheckrStatus',
      'selectedPayoneerStatus',
      'selectedInspectionStatus',
    ].forEach((f) => { filters[f] = '*'; });

    filters.query = '';

    this.setState(filters, this.getUsers);
  }

  onPayoneerStatusRefresh() {
    this.setState({ loading: true});
    this.props.actions.updatePayoneerStatus().then(() => this.getUsers());
  }

  onCarTypesChange({target: {selectedOptions}}) {
    const selectedCarType = getMultipleSelectValues(selectedOptions, this.state.selectedCarType);
    this.setState({ selectedCarType, loading: true, activePage: 0 }, this.getUsers);
  }

  onExportToCSV() {
    this.openModal();
  }

  onUserTypeChange(event) {
    this.setState({
      selectedUserType: event.target.value,
      loading: true,
      activePage: 0,
    }, this.getUsers);
  }

  onUserStatusChange(event) {
    this.setState({
      selectedStatus: event.target.value,
      loading: true,
      activePage: 0,
    }, this.getUsers);
  }

  onCheckrStatusChange({target: {selectedOptions}}) {
    const selectedCheckrStatus =
      getMultipleSelectValues(selectedOptions, this.state.selectedCheckrStatus);
    this.setState({ selectedCheckrStatus, loading: true, activePage: 0 }, this.getUsers);
  }

  onPayoneerStatusChange({target: {selectedOptions}}) {
    const selectedPayoneerStatus =
      getMultipleSelectValues(selectedOptions, this.state.selectedPayoneerStatus);
    this.setState({ selectedPayoneerStatus, loading: true, activePage: 0 }, this.getUsers);
  }

  onInspectionStatusChange({target: {selectedOptions}}) {
    const selectedInspectionStatus =
      getMultipleSelectValues(selectedOptions, this.state.selectedInspectionStatus);
    this.setState({ selectedInspectionStatus, loading: true, activePage: 0 }, this.getUsers);
  }

  onSelectSearchType(event) {
    this.setState({ selectedSearchType: event.value, queryChanged: true });
  }

  onQueryChange(event) {
    this.setState({ query: event.target.value, queryChanged: true });
  }

  onCityChange() {
    this.setState({activePage: 0}, () => this.getUsers());
  }

  onSearchSubmit(e) {
    e.preventDefault();

    this.setState({
      data: null,
      loading: true,
    }, this.getUsers);
  }

  onSortChange(e, sortInfo) {
    this.setState({ sort: sortInfo.sort, loading: true }, this.getUsers);
  }

  onPaginationClick(eventKey) {
    if (eventKey === this.state.activePage) return;
    this.setState({
      activePage: eventKey,
      loading: true,
    }, () => {
      this.getUsers();
    });
  }

  onWomenOnlyClick(driverID, driverTypes) {
    const { womenOnly } = this.props.usersListData;
    const newState = !womenOnly[driverID].womenOnly;

    const params = {driverTypes: driverTypes.join()};
    console.log(params);
    if (newState) {
      driverTypes.push('WOMEN_ONLY');
    } else {
      const index = driverTypes.indexOf('WOMEN_ONLY');
      driverTypes.splice(index, 1);
    }
    params.driverTypes = driverTypes.join();

    this.props.actions.driversToogleWomenOnly(driverID, params, newState);
  }

  getQuery() {
    const params = {};
    if (!this.state.query) {
      return params;
    }

    const queryType = this.state.selectedSearchType;

    if (queryType === 'id' && this.state.selectedUserType === 'drivers') {
      params.driverId = this.state.query;
    } else if (queryType === 'id') {
      params.riderId = this.state.query;
    } else {
      params[queryType] = this.state.query;
    }

    return params;
  }

  getUsers() {
    const activePage = this.state.queryChanged ? 0 : this.state.activePage;
    let params = {
      page: activePage,
      type: this.state.selectedUserType,
      sort: this.state.sort.column,
      desc: this.state.sort.desc,
    };
    const {selectedStatus = {}} = this.state;

    if (_.includes(['active', 'notActive'], selectedStatus)) {
      params.active = selectedStatus === 'active';
    }

    if (_.includes(['enabled', 'notEnabled'], selectedStatus)) {
      params.enabled = selectedStatus === 'enabled';
    }

    if (this.state.selectedInspectionStatus !== '*') {
      params.carInspectionStatus = this.state.selectedInspectionStatus;
    }

    if (this.state.selectedCarType !== '*') {
      params.carCategory = this.state.selectedCarType;
    }

    if (this.state.selectedCheckrStatus !== '*') {
      params.checkrStatus = this.state.selectedCheckrStatus;
    }

    if (this.state.selectedPayoneerStatus !== '*') {
      params.payoneerStatus = this.state.selectedPayoneerStatus;
    }

    params = {
      ...params,
      ...this.getQuery(),
      pageSize: this.state.pageSize,
    };

    const {
      selectedInspectionStatus,
      selectedPayoneerStatus,
      selectedCheckrStatus,
      selectedCarType,
      selectedUserType,
      selectedSearchType,
      query,
      selectedCity,
    } = this.state;

    const filters = {
      selectedInspectionStatus,
      selectedPayoneerStatus,
      selectedCheckrStatus,
      selectedCarType,
      selectedStatus,
      selectedUserType,
      selectedSearchType,
      query,
      selectedCity,
    };

    params = Object.assign({}, { avatarType: 'ADMIN' }, params);
    this.setState({loading: true});
    this.props.actions.getDrivers(params, filters).then(({payload: {serverResponse}}) => {
      this.setState({
        loading: false,
        queryChanged: false,
        activePage,
        serverResponse,
      }, () => this.processUsers(this.props.usersListData));
    });
  }

  getActionButtons(user, props) {
    const {womenOnly} = props;
    const that = this;

    function renderWomenOnlyButton(state) {
      if (state) {
        const womanOnlyState = womenOnly[user.driverId];
        if (!womanOnlyState) return false;
        return (
          <Button
            bsSize="xsmall"
            bsStyle={womanOnlyState.womenOnly ? 'primary' : 'default'}
            onClick={() => that.onWomenOnlyClick(user.driverId, user.driverTypes)}
            disabled={!!womanOnlyState.status}
          >{womanOnlyState.status ? womanOnlyState.status : 'Women only'}</Button>
        );
      }
      return false;
    }

    return (
      <div>
        <Link to={`/${this.state.selectedUserType}/history/${user.driverId}`}>
          <Button bsSize="xsmall">History</Button>
        </Link>
        <Link to={`/${this.state.selectedUserType}/edit/${user.driverId}`}>
          <Button bsSize="xsmall" className="">Edit</Button>
        </Link>
        {renderWomenOnlyButton(womenOnly)}
      </div>
    );
  }

  getActiveOrEnabled() {
    let status = null;

    if (this.state.selectedStatus === 'enabled') {
      status = { enabled: true };
    }

    if (this.state.selectedStatus === 'notEnabled') {
      status = { enabled: false };
    }

    if (this.state.selectedStatus === 'notActive') {
      status = { active: false };
    }

    if (this.state.selectedStatus === 'active') {
      status = { active: true };
    }

    return status;
  }

  processUsers(props) {
    const {serverResponse: users, loading} = props;
    function getAllOfOneType(cars, types) {
      return _.map(types, type => _.chain(cars).map(car => car[type]).join(', ').value());
    }

    function renderPicture({
      driverLicencePicture,
      driverPicture,
      riderPictureUrl,
    }, loadingPic, type) {
      const pictureUrl = type === 'drivers' ? driverPicture || driverLicencePicture : riderPictureUrl;
      if (pictureUrl && !loadingPic) {
        return (
          <a href={pictureUrl} rel={'noopener'} target="_blank" className="user-picture-wrapper">
            <i className="fa fa-picture-o placeholder" aria-hidden="true" />
            <img
              alt="user"
              ref={(e) => {
                if (e) {
                  e.parentNode.classList.toggle('loading');
                  e.parentNode.classList.remove('error');
                  e.parentNode.classList.remove('loaded');
                }
              }}
              className="user-picture"
              src={pictureUrl}
              onLoad={({target}) => {
                target.parentNode.classList.remove('loading');
                target.parentNode.classList.add('loaded');
              }}
              onError={({target}) => {
                target.parentNode.classList.remove('loading');
                target.parentNode.classList.add('error');
              }}
            />
          </a>
        );
      }
      return (
        <div className="user-picture-wrapper">
          <i className="fa fa-picture-o placeholder" aria-hidden="true" />
        </div>
      );
    }

    function getUserCars(user) {
      const userCars =
        _.chain(user.cars)
        .map((car) => {
          const categories = car.categories.map((cat) => {
            if (cat === 'REGULAR') return 'STANDARD';
            return cat;
          });
          const Cars = _.join(categories, ', ');
          const Model = car.model;
          const Year = car.year;
          const Maker = car.make;
          const InspectionStatus = car.inspectionStatus;

          return { Cars, Model, Year, Maker, InspectionStatus };
        })
        .value();

      const [Maker, Model, Year, Cars, InspectionStatus] = getAllOfOneType(userCars, ['Maker', 'Model', 'Year', 'Cars', 'InspectionStatus']);
      const rating = (user.rating) ? user.rating.toFixed(2) : 'N/A';

      return { Cars, 'Driver Rating': rating, 'Car Maker': Maker, Model, Year, 'Inspection Status': InspectionStatus};
    }

    const paginatedUsers = [];

    if (users.content.length) {
      users.content.forEach((user) => {
        if (user.riderId) user.driverId = user.riderId;
        const userTypeIdKey = this.state.selectedUserType === 'drivers' ? 'Driver Id' : 'Rider Id';
        const listUser = {
          Picture: renderPicture(user, loading, this.state.selectedUserType),
          Fullname: `${user.firstName} ${user.lastName}`,
          Email: user.email,
          Phone: user.phoneNumber,
          Active: user.active,
          Enabled: user.enabled,
          Payoneer: user.payoneerStatus,
          [userTypeIdKey]: <Link to={`/profile/${this.state.selectedUserType}/${user.driverId}`}>{user.driverId}</Link>,
        };

        if (this.state.selectedUserType === 'drivers') {
          Object.assign(listUser, getUserCars(user));
        }

        listUser['Last Login'] = moment(user.lastLoginDate).format('YYYY-MM-DD');

        listUser.Actions = this.getActionButtons(user, props);

        paginatedUsers.push(listUser);
      });
    }

    paginatedUsers.totalElements = users.totalElements;
    paginatedUsers.totalPages = users.totalPages;
    paginatedUsers.size = users.size;
    this.setState({ paginatedUsers });
  }

  isFilterSelected(value) {
    return value === '*' ? undefined : value;
  }

  sendDriverData() {
    let params = {
      payoneerStatus: this.isFilterSelected(this.state.selectedPayoneerStatus),
      checkrStatus: this.isFilterSelected(this.state.selectedCheckrStatus),
      carCategory: this.isFilterSelected(this.state.selectedCarType),
      carInspectionStatus: this.isFilterSelected(this.state.selectedInspectionStatus),
      avatarType: 'ADMIN',
    };

    _.forEach((v, key) => {
      if (params[key] === 'ALL') {
        params[key] = null;
      }
    });

    if (this.getActiveOrEnabled()) {
      params = Object.assign({}, this.getActiveOrEnabled(), params);
    }

    params = {
      ...params,
      ...this.getQuery(),
    };
    this.props.sendDriversReport(params).then(() => {
      this.closeModal();
    });
  }

  sendRidersData() {
    let params = {
      avatarType: 'ADMIN',
    };

    if (this.state.query) {
      params[this.state.selectedSearchType.value] = this.state.query;
    }

    if (this.getActiveOrEnabled()) {
      params = Object.assign({}, this.getActiveOrEnabled(), params);
    }

    params = {
      ...params,
      ...this.getQuery(),
    };

    if (!params.active) params.active = true;

    this.props.sendRidersReport(params).then(() => {
      this.closeModal();
    });
  }

  sendUserData() {
    if (this.state.selectedUserType === 'drivers') {
      this.sendDriverData();
    }

    if (this.state.selectedUserType === 'riders') {
      this.sendRidersData();
    }
  }

  isWomenOnly(user) {
    if (user && user.driverTypes) {
      const {driverTypes} = user;
      return _.indexOf(driverTypes, 'WOMEN_ONLY') > -1;
    }
    return false;
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  openModal() {
    this.setState({ showModal: true });
  }

  renderFilters() {
    const carTypesMap = this.props.carTypesMap;
    const carTypesArr = carTypesMap ? carTypesMap.allItems : [];
    const isDriver = this.state.selectedUserType === 'drivers';

    return (
      <Well bsSize="small" className="bottom0 filters">
        <Row>
          <Form inline>
            <Col sm={5} style={{paddingRight: 0}}>
              <SelectFilter
                title="User Type"
                defaultValue={this.state.selectedUserType}
                sm="4"
                key={_.uniqueId()}
                onChange={this.onUserTypeChange}
                options={constants.common.userTypes}
              />
              <SelectFilter
                title="Status"
                sm="4"
                defaultValue={this.state.selectedStatus}
                onChange={this.onUserStatusChange}
                options={constants.common.statusTypes}
                key={_.uniqueId()}
                placeholder={this.state.selectedStatus}
                showAll
              />
            </Col>
            <Col sm={7} style={{paddingLeft: 0}}>
              {isDriver && [
                <SelectFilter
                  title="Car Type"
                  defaultValue={this.state.selectedCarType.split(',')}
                  showAll
                  sm="3"
                  valueField="carCategory"
                  nameField="title"
                  onChange={this.onCarTypesChange}
                  options={carTypesArr}
                  key={_.uniqueId()}
                  multiple
                />,
                <SelectFilter
                  title="CheckR"
                  defaultValue={this.state.selectedCheckrStatus.split(',')}
                  showAll sm="3"
                  multiple
                  onChange={this.onCheckrStatusChange}
                  options={constants.common.checkr}
                  key={_.uniqueId()}
                />,
                <SelectFilter
                  title="Payoneer"
                  defaultValue={this.state.selectedPayoneerStatus.split(',')}
                  showAll
                  sm="3"
                  multiple
                  onChange={this.onPayoneerStatusChange}
                  options={constants.common.payoneer}
                  key={_.uniqueId()}
                />,
                <SelectFilter
                  title="Inspection Status"
                  defaultValue={this.state.selectedInspectionStatus.split(',')}
                  showAll
                  sm="3"
                  multiple
                  onChange={this.onInspectionStatusChange}
                  options={constants.common.inspectionStatus}
                  key={_.uniqueId()}
                />,
              ]}
            </Col>
          </Form>
        </Row>
        <Row>
          {this.renderSearchBox()}
          {this.renderFilterButtons()}
        </Row>
      </Well>
    );
  }

  renderFilterButtons() {
    return (
      <Col sm={4} className="top10">
        <ButtonToolbar>
          <Button onClick={() => this.onExportToCSV()}>Export CSV</Button>
          <Button onClick={() => this.onClearFilters()}>Clear filters</Button>
          <Button onClick={() => this.onPayoneerStatusRefresh()}>Refresh Payoneer Status</Button>
        </ButtonToolbar>
      </Col>
    );
  }

  renderSearchBox() {
    return (
      <Col sm={3} className="">
        <Form className="top10 search" onSubmit={this.onSearchSubmit}>
          <InputGroup>
            <FormControl
              type="text"
              value={this.state.query}
              onChange={this.onQueryChange}
              placeholder={`Search ${this.state.selectedSearchType}...`}
            />
            <DropdownButton
              componentClass={InputGroup.Button}
              id="input-dropdown-addon"
              title={this.state.selectedSearchType}
            >
              {constants.users.searchTypes.map(type => (
                <MenuItem
                  key={type.value}
                  eventKey={type.value}
                  onSelect={() => setTimeout(this.onSelectSearchType(type))}
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

  render() {
    const userTypeName =
      constants.common.userTypes.filter(type => type.value === this.state.selectedUserType)[0].name;
    if (this.state.serverResponse) {
      return (
        <section className="users">
          <PropsWatcher prop="common.selectedCity" handler={this.onCityChange} />
          <div className={styles.users}>
            {this.renderFilters()}
            {this.state.paginatedUsers &&
              <PaginatedTable
                sortable={[
                  {name: 'Fullname', property: 'user.firstname', sort: true},
                  {name: 'Email', property: 'user.email', sort: true},
                  {name: 'Driver Id', property: 'id', sort: true},
                  {name: 'Rider Id', property: 'id', sort: true},
                ]}
                onPageChange={this.onPaginationClick}
                serverResponse={this.state.serverResponse}
                className={'driversRidesReport top15'}
                noDataText={'Could not find data.'}
                data={this.state.paginatedUsers}
                defaultSort={this.state.sort}
                onSortChange={this.onSortChange}
                loading={this.state.loading}
                loadingText="Loading users"
              />
            }
          </div>
          <ExportModal
            show={this.state.showModal}
            closeModal={this.closeModal}
            userEmail={this.props.user && this.props.user.email}
            selectedUserType={userTypeName}
            sendUserData={this.sendUserData}
          />
        </section>
      );
    }
    return <Loading loading={this.state.loading} />;
  }
}
export default cssModules(Users, styles);

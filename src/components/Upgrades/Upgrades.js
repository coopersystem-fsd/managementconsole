import React, { Component } from 'react';
import {
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import {PaginatedTable, ConfirmModal} from '../';
import styles from './Upgrades.scss';
import PropsWatcher from '../../containers/PropsWatcher';
import constants from '../../data/constants';
import EditUpgradesModal from './EditUpgradesModal';

class Upgrades extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 100,
      serverResponse: {
        content: [],
      },
      loading: true,
      filters: constants.upgrades.slice(),
      sortable: [
        { name: 'Avatar', property: 'avatarType', sort: true },
        { name: 'Platform', property: 'platformType', sort: true },
        { name: 'Version', property: 'version', sort: true },
        { name: 'Mandatory', property: 'mandatoryUpgrade', sort: true },
        { name: 'User Agent Header', property: 'userAgentHeader', sort: true },
        { name: 'Actions', property: 'actions', sort: false },
      ],
    };
  }

  componentDidMount() {
    this.state.cityId = this.props.selectedCity;
    this.handleLoad();
    this.handleLoadDebounced = _.debounce(this.handleLoad, 500);
  }

  onDeleteApp() {
    this.props.actions.deleteUpgrades(this.state.deleteApp)
      .then(() => {
        this.setState({deleteApp: null});
        this.handleLoad();
      });
  }

  getFilterParams() {
    const {page, desc, sort, cityId, pageSize} = this.state;
    const params = Object.assign({}, {page, desc, sort, pageSize});
    if (cityId === '*') delete params.cityId;
    else {
      // params.cityId = this.props.selectedCity;
      params.cityId = this.state.cityId;
    }
    return params;
  }

  mapUsers(content) {
    return this.table ? _.map(content, (row) => {
      const mappedRow = Object.assign({}, row);
      mappedRow.actions = (
        <ButtonToolbar>
          <Button
            bsSize="xsmall"
            bsStyle="danger"
            onClick={() => this.setState({deleteApp: mappedRow})}
          >Delete</Button>
          <Button
            bsSize="xsmall"
            onClick={() => this.setState({edit: row})}
          >Edit</Button>
        </ButtonToolbar>
      );
      return this.table.tableConfig.getDataMap(mappedRow);
    }) : null;
  }

  handleLoad() {
    const params = this.getFilterParams();
    this.props.actions.getUpgrades(params)
      .then(({payload: {serverResponse, error}}) => {
        const state = { loading: false };
        if (!error) {
          state.serverResponse = serverResponse;
          state.data = this.mapUsers(serverResponse.content);
        }
        this.setState(state);
      });
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

  renderDeleteAppModal() {
    if (this.state.deleteApp) {
      return (
        <ConfirmModal
          show={!!this.state.deleteApp}
          title={'Are you sure you want to delete app version?'}
          yesText="Delete"
          noText="Cancel"
          body={`${this.state.deleteApp.avatarType} ${this.state.deleteApp.version} for ${this.state.deleteApp.platformType}.`}
          onYesClick={() => this.onDeleteApp()}
          onNoClick={() => { this.setState({deleteApp: null}); }}
        />
      );
    }
    return false;
  }

  render() {
    return (
      <div className="upgrades clearfix row">
        <PropsWatcher prop="common.selectedCity" handler={cityId => this.setState({cityId}, this.handleLoad)} />
        <Button
          className="bottom15"
          onClick={() => this.setState({edit: {}})}
        >Create new</Button>
        {this.renderTable()}
        {this.renderDeleteAppModal()}
        <EditUpgradesModal
          show={!!this.state.edit}
          edit={this.state.edit}
          selectedCity={this.state.cityId}
          onClose={() => this.setState({edit: null}, () => this.handleLoad())}
          onChange={(u) => {
            if (u.id) return this.props.actions.updateUpgrades(u);
            return this.props.actions.createUpgrades(u);
          }}
        />
      </div>
    );
  }
}

export default cssModules(Upgrades, styles);

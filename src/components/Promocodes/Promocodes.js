import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import {Button, ButtonToolbar, FormControl, FormGroup, Col, Row} from 'react-bootstrap';
import styles from './Promocodes.scss';
import {PaginatedTable, EditPromocodeModal} from '../';
import Loading from '../Loading';
import {getTexasTime} from '../../helpers/common';
import PropsWatcher from '../../containers/PropsWatcher';

class Promocodes extends Component { // eslint-disable-line react/prefer-stateless-function
  // Props Types
  static propTypes = {
  };

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);

    this.state = {
      tableSort: null,
      sort: null,
      desc: null,
      page: 0,
      pageSize: 100,
      codeLiteral: '',
      promocodes: [],
      edit: null,
      new: null,
      sortable: [
        { name: 'Title', property: 'title', sort: true },
        { name: 'Code Literal', property: 'codeLiteral', sort: true },
        { name: 'New Riders', property: 'newRidersOnly', sort: true },
        { name: 'Next Trip Only', property: 'nextTripOnly', sort: true },
        { name: 'Applicable to Fees', property: 'applicableToFees', sort: true },
        { name: 'Cities', property: 'cities', sort: 'cityBitmask' },
        { name: 'Car Types', property: 'carTypes', sort: 'carTypeBitmask' },
        { name: 'Uses', property: 'usageCount', sort: false },
        { name: 'Value', property: 'codeValue', sort: true },
        { name: 'Current Redemption', property: 'currentRedemption', sort: true },
        { name: 'Maximum Redemption', property: 'maximumRedemption', sort: true },
        { name: 'Starts on', property: 'startsOn', sort: true },
        { name: 'Ends on', property: 'endsOn', sort: true },
        { name: 'Actions', property: 'actions', sort: false },
      ],
      usage: {},
    };

    this.onCityChange = this.onCityChange.bind(this);
  }

  componentWillMount() {
    this.handleLoad();
    this.debounceCodeLiteral = _.debounce(this.handleLoad, 300);
  }

  onReloadRows() {
    const promocodes = this.mapPromocodes(this.props.promocodes.serverResponse.content);
    this.setState({promocodes});
  }

  onCityChange(event) {
    this.setState({page: 0, codeLiteral: ''}, () => this.handleLoad(event));
  }

  handleLoad(city) {
    const params = Object.assign({}, {
      page: this.state.page,
      sort: this.state.sort,
      pageSize: this.state.pageSize,
      desc: this.state.desc,
      codeLiteral: this.state.codeLiteral,
      cityBitMask: city || this.props.selectedCity,
    });

    if (this.state.codeLiteral === '') delete params.codeLiteral;

    this.setState({loading: true});
    this.props.actions.getPromocodes(params)
      .then(({payload}) => {
        if (payload.error) {
          this.setState({loading: false});
        } else {
          const promocodes = this.mapPromocodes(payload.serverResponse.content);
          this.setState({promocodes, loading: false});
        }
      });
  }

  mapPromocodes(promocodes) {
    const citiesMap = {};
    this.props.cities.forEach((city) => { citiesMap[city.id] = city.name; });
    const carTypes = {};
    this.props.carTypes.forEach((carType) => { carTypes[carType.carCategory] = carType.title; });
    return _.map(promocodes, (row) => {
      const dateFormat = 'YYYY-MM-DD hh:mm a';
      const mappedRow = Object.assign({}, row);
      mappedRow.newRidersOnly = <i className={`fa fa-${row.newRidersOnly ? 'check' : 'times'}`} />;
      mappedRow.nextTripOnly = <i className={`fa fa-${row.nextTripOnly ? 'check' : 'times'}`} />;
      mappedRow.applicableToFees = <i className={`fa fa-${row.applicableToFees ? 'check' : 'times'}`} />;
      mappedRow.cities = row.cities.map(city => citiesMap[city]);
      mappedRow.carTypes = row.carTypes.map(carType => carTypes[carType]);
      mappedRow.startsOn =
        row.startsOn ? getTexasTime(moment(row.startsOn), false).format(dateFormat) : null;
      mappedRow.endsOn =
        row.endsOn ? getTexasTime(moment(row.endsOn), false).format(dateFormat) : null;
      mappedRow.usageCount = this.state.usage[row.id] == null ?
        (
        <Button
          bsSize="xsmall"
          onClick={() => {
            this.props.actions.getUsageCount(row.id)
              .then((data) => {
                const usage = this.state.usage;
                usage[row.id] = data.payload;
                this.setState({usage}, this.onReloadRows);
              });
          }}
        >{this.state.usage[row.id] ? this.state.usage[row.id] : 'Show'}
        </Button>
        ) : this.state.usage[row.id];
      mappedRow.actions = (
        <ButtonToolbar>
          <Button
            disabled={this.state.editLoading}
            bsSize="xs"
            onClick={() => {
              this.setState({editLoading: true}, this.onReloadRows);
              this.props.actions.getPromocode(row.id)
                .then(({payload: edit}) => {
                  edit.replicate = true;
                  this.setState({edit, editLoading: false}, this.onReloadRows);
                });
            }}
          >Replicate</Button>
          <Button
            disabled={this.state.editLoading}
            bsSize="xs"
            onClick={() => {
              this.setState({editLoading: true}, this.onReloadRows);
              this.props.actions.getPromocode(row.id)
                .then(({payload: edit}) => {
                  this.setState({edit, editLoading: false}, this.onReloadRows);
                });
            }}
          >Edit</Button>
        </ButtonToolbar>
      );
      return this.table.tableConfig.getDataMap(mappedRow);
    });
  }

  renderTable({serverResponse = {}, loading}) {
    if (serverResponse) {
      return (
        <PaginatedTable
          className={'promocodes-table'}
          ref={(ref) => { this.table = ref; }}
          serverResponse={serverResponse}
          data={this.state.promocodes}
          loading={loading}
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
    return <Loading loading />;
  }

  renderSearch({loading}) {
    if (!loading) {
      return (
        <FormGroup controlId="formControlsTextarea">
          <FormControl
            type="text"
            value={this.state.codeLiteral}
            onChange={({target: {value: codeLiteral}}) =>
              this.setState({codeLiteral}, this.debounceCodeLiteral)}
            placeholder="Search Code Literal"
          />
        </FormGroup>
      );
    }
    return false;
  }

  renderNewPromocodeButton({loading}) {
    if (!loading) {
      return (
        <Button className="pull-right" onClick={() => this.setState({edit: true})}>New Code</Button>
      );
    }
    return false;
  }

  renderPromocodeModal() {
    if (this.state.edit) {
      const params = this.props.promocodes.params;
      return (
        <EditPromocodeModal
          show={!!this.state.edit}
          promocode={this.state.edit}
          allCities={this.props.cities}
          allCarTypes={this.props.carTypes}
          onEditPromocode={promocode => this.props.actions.updatePromocode(promocode, params)}
          onCreatePromocode={promocode => this.props.actions.createPromocode(promocode, params)}
          onSuccess={() => this.setState({edit: null}, this.handleLoad)}
          onCancel={() => this.setState({edit: null})}
        />
      );
    }
    return false;
  }

  render() {
    const promocodes = Object.assign({}, this.props.promocodes);
    return (
      <div className="promocodes">
        <PropsWatcher prop="common.selectedCity" handler={this.onCityChange} />
        <Row>
          <Col xs={6} sm={3}>
            {this.renderSearch(promocodes)}
          </Col>
          <Col xs={6} sm={9}>
            {this.renderNewPromocodeButton(promocodes)}
          </Col>
        </Row>
        {this.renderTable(promocodes)}
        {this.renderPromocodeModal()}
      </div>
    );
  }

}

export default cssModules(Promocodes, styles);

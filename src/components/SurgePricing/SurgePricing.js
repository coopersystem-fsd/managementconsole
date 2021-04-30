import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import _ from 'lodash';
import {FormGroup, FormControl, Checkbox, Button, Well, Col, SplitButton, MenuItem} from 'react-bootstrap';
import {PolygonMap, PaginatedTable, AddPolygonModal, EditModeButton} from '../';
import styles from './SurgePricing.scss';
import PropsWatcher from '../../containers/PropsWatcher';
import Options from '../common/Options';
import constants from '../../data/constants';


class SurgePricing extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      cityId: '*',
      editMode: false,
      editedPolygons: [],
      pageSize: 1000,
      page: 0,
      sortable: [
        { name: 'Id', property: 'Id', sort: true },
        { name: 'Name', property: 'name', sort: true },
        { name: 'Surge', property: 'surgeFactor', sort: true },
        { name: 'Recomm.', property: 'recommendedSurgeFactor', sort: true },
        { name: 'Missed', property: 'numberOfRequestedRides', sort: true },
        { name: 'Accepted', property: 'numberOfAcceptedRides', sort: true },
        { name: 'Eyes', property: 'numberOfEyeballs', sort: true },
        { name: 'Cars', property: 'numberOfCars', sort: true },
        { name: 'Avail. Cars', property: 'numberOfAvailableCars', sort: true },
        { name: 'Car Categories', property: 'carCategories', sort: true},
      ],

    };
    this.pfMode = {title: 'change  mode', options: [{id: 'FULL_AUTO', name: 'FULL AUTO'}, {id: 'LIMITED_AUTO', name: 'LIMITED AUTO'}, {id: 'MANUAL', name: 'MANUAL'}]};
    this.handleOnClickEvent = ({target}) => {
      const elClassName = target.className.indexOf('table-row-select') > -1;
      const parentClassName = target.parentElement ? target.parentElement.className.indexOf('table-row-select') > -1 : false;
      if (!elClassName && !parentClassName && this.state.options) {
        this.setState({options: false});
      }
    };
    this.buildSortedCarCategories = (carCategoriesFactors) => {
      const mergeCategoriesWithFactors = (sortedCategories, carWithFactors) => {
        const result = {};
        sortedCategories.forEach((sc) => {
          const factor = carWithFactors[sc];
          if (factor !== undefined) result[sc] = carWithFactors[sc];
        });
        return result;
      };
      const carTypes = _.get(this.props.common, 'carTypesMap.allItems');

      const sortedCategories = carTypes.map(ct => ct.carCategory);
      const catWithFactors = mergeCategoriesWithFactors(sortedCategories, carCategoriesFactors);
      return catWithFactors;
    };
  }


  componentWillMount() {
    this.handleLoad();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOnClickEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOnClickEvent);
    this.props.actions.stopAutoFetch();
  }

  onEditPolygon(polygon) {
    const polygons = this.props.surgePricing.polygons.slice();
    polygon.csvGeometry = this.getCsvGeometry(polygon.paths);
    const {lat, lng} = polygon.marker.getPosition();
    polygon.labelLat = lat();
    polygon.labelLng = lng();

    const selectedPolygon = _.find(polygons, {id: polygon.id});
    const editedPolygon = Object.assign({}, selectedPolygon);

    if (editedPolygon && _.isObject(editedPolygon)) {
      const params = Object.keys(editedPolygon);
      _.forEach(polygon, (v, k) => {
        if (params.indexOf(k) > -1) editedPolygon[k] = v;
      });
    }

    this.props.actions.updateSurgePricing(editedPolygon);
  }

  onRowClick(tableRow) {
    const id = _.toNumber(tableRow.childNodes[0].innerHTML);
    const isHeader = tableRow.childNodes[0].nodeName === 'TH';
    const tbody = isHeader ? tableRow.parentNode.nextSibling : tableRow.parentNode;
    const {polygons} = this.props.surgePricing;

    _.forEach(tbody.childNodes, (tr) => { tr.className = ''; });

    if (!isHeader) {
      tableRow.className = 'info';
      this.props.actions.selectPolygon({polygons, id});
    }
  }

  onAddPolygon(polygon) {
    // polygon.csvGeometry = this.getCsvGeometry(polygon.paths);
    if (polygon.newPolygon) {
      polygon.labelLat = polygon.centerPointLat;
      polygon.labelLng = polygon.centerPointLng;
      polygon.surgeFactor = 1;
      polygon.newPolygon = false;
      polygon.setMap(null);
      polygon.id = _.uniqueId();
      const newPolygon = this.mapPolygon(polygon);
      newPolygon.cityId = this.props.common.selectedCity;
      this.props.actions.createSurgePricing(newPolygon)
        .then(() => this.setState({ showAddNewPolygonModal: false }));
    } else {
      this.props.actions.updatePolygonName(polygon)
        .then(({payload}) => {
          this.addEditedPolygon(payload);
          this.setState({ showAddNewPolygonModal: false });
        });
    }
  }

  onEditMode() {
    const {editMode} = this.state;
    this.props.actions.stopAutoFetch();
    this.setState({editMode: !editMode});
    this.props.actions.showNotification('You entered on mode edition');
  }

  onSaveEdition(newPolygons) {
    this.props.actions.updateEditedSurgeAreas(newPolygons).then(({payload}) => {
      if (payload.length > 0) this.props.actions.showNotification(`Error saving surge areas:  ${payload}`); else {
        this.props.actions.showNotification('Surge Areas updated succesfully');
      }
      this.props.actions.startAutoFetch();
      this.setState({editMode: false, editedPolygons: []});
    }).catch((err) => {
      this.props.actions.handleError(err);
      this.props.actions.loadSurgePricing(false);
      this.props.actions.startAutoFetch();
      this.setState({editMode: false, editedPolygons: []});
    });
  }

  onCancelEdition() {
    this.props.actions.startAutoFetch();
    this.setState({editMode: false, editedPolygons: []});
    this.props.actions.showNotification('Edition has been cancelled');
  }


  getCsvGeometry(paths) {
    return _.chain(paths).map(({lng, lat}) => `${lng},${lat}`).join(' ').value();
  }

  getPaths(csvGeometry) {
    return csvGeometry
            .split(' ')
            .map((latLng) => {
              const [lng, lat] = latLng.split(',');
              return {lat, lng};
            });
  }


  getSurgeOptions() {
    const options = [];
    const { min, mid, max, minstep, midstep } = constants.surgePricing.surgeFactor;

    for (let i = min; i <= max; i += (i < mid ? minstep : midstep)) {
      options.push({id: i, name: i.toFixed(2)});
    }

    return options;
  }

  addEditedPolygon(polygon) {
    const index = _.findIndex(this.state.editedPolygons, {id: polygon.id});
    const isAlreadyIncluded =
      index > -1;
    if (!isAlreadyIncluded) {
      this.state.editedPolygons.push(polygon);
    } else {
      const mergedPolygon = this.state.editedPolygons[index];
      mergedPolygon.carCategories = polygon.carCategories;
      mergedPolygon.carCategoriesFactors = polygon.carCategoriesFactors;
      mergedPolygon.automated = polygon.automated;
    }
  }

  handleSwitchPFMode(surgeMode) {
    const payload = Object.assign({},
      {
        cityId: this.props.common.selectedCity,
        surgeMode: surgeMode.target.id,
      },
    );
    this.props.actions.updatePrioritiesFareMode(payload);
  }

  handleLoad({cityId} = {}) {
    const {page, pageSize} = this.state;
    const params = Object.assign({},
      {
        page,
        pageSize,
        cityId: cityId || this.props.common.selectedCity,
      },
    );

    if (this.polygonMap && this.polygonMap.getSelectedPolygon()) {
      const pm = this.polygonMap;
      pm.getSelectedPolygon().setMap(null);
      pm.onTogglePolygonEditMode(false);
    }

    this.props.actions.getCurrentSurgeMode(params);

    this.props.actions.getSurgePricing(params)
      .then(() => {
        this.props.actions.startAutoFetch();
        const city = _.find(this.props.common.cities, {id: this.props.common.selectedCity});
        if (this.polygonMap && city) {
          this.polygonMap.setCenter(
            city.areaGeometry.centerPointLat,
            city.areaGeometry.centerPointLng,
          );
        }
      });
  }

  mapPolygon(polygon) {
    const polygonObject = {
      automated: true,
      bottomRightCornerLat: 0,
      bottomRightCornerLng: 0,
      carCategories: [],
      centerPointLat: 0,
      centerPointLng: 0,
      cityId: 0,
      csvGeometry: 'string',
      labelLat: 0,
      labelLng: 0,
      id: 0,
      name: 'string',
      numberOfAcceptedRides: 0,
      numberOfAvailableCars: 0,
      numberOfCars: 0,
      numberOfEyeballs: 0,
      numberOfRequestedRides: 0,
      recommendedSurgeFactor: 0,
      surgeFactor: 0,
      topLeftCornerLat: 0,
      topLeftCornerLng: 0,
    };
    const keys = Object.keys(polygonObject);

    _.forEach(polygon, (v, k) => {
      if (keys.indexOf(k) > -1) polygonObject[k] = v;
    });
    return polygonObject;
  }

  mapTableRows(rows) {
    return _.map(rows, row => (
      {
        Id: row.id,
        Name: row.name || row.id,
        Surge: this.renderUsedSurgeFactor(row, row.carCategories, row.id),
        Recommended: this.renderSuggestedSurgeFactor(row),
        Automation: this.renderAtomation(row),
        Eyes: this.renderEyeballsPerCategory(row),
        Missed: this.renderMissedPerCategory(row),
        Accepted: this.renderAcceptedPerCategory(row),
        Cars: this.renderCarsPerCategory(row),
        'Avail. Cars': this.renderAvailCarsPerCategory(row),
        'Car Categories': this.renderCarCategoriesCheckboxes(row),
        Actions: <Button
          bsStyle="primary"
          bsSize="xsmall"
          disabled={!this.state.editMode}
          onClick={() => this.setState({showAddNewPolygonModal: true, newPolygon: row})}
        >Change Name</Button>,
      }
    ));
  }

  renderUsedSurgeFactor(polygon, carCategories, id) {
    const isDisabled = _.isEmpty(carCategories);
    const style = {
      cursor: isDisabled ? 'default' : 'pointer',
      opacity: isDisabled ? 0.65 : 1,
      color: isDisabled ? '#5d5d5d ' : '#158cba ',
    };
    const {carCategoriesFactors = []} = polygon;

    const indents = [];
    const {editMode} = this.state;
    Object.entries(this.buildSortedCarCategories(carCategoriesFactors)).forEach(([key, value]) => {
      if (editMode) {
        indents.push(<tr>
          <td>val:</td>
          <td>
            <Col
              className={'table-row-select'}
              onClick={(event) => {
                const options = {
                  disabled: false,
                  id,
                  x: event.nativeEvent.layerX - event.nativeEvent.offsetX,
                  y: event.nativeEvent.layerY - event.nativeEvent.offsetY,
                  carCategory: key,
                };
                this.setState({options});
              }}
            >
              <span
                className={isDisabled ? '' : 'pointer'}
                style={style}
              >
                {value.toFixed(2)}
              </span>
            </Col>
          </td>
          <td>{key}</td>
        </tr>);
      } else {
        indents.push(<tr>
          <td>val:</td>
          <td>
            <Col>
              <span>
                {value.toFixed(2)}
              </span>
            </Col>
          </td>
          <td>{key}</td>
        </tr>);
      }
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
    );
  }

  renderAtomation(polygon) {
    let content;
    if (polygon.automated) {
      content = (
        <div>
          <div><i>active</i></div>
          <Button
            bsStyle="primary"
            bsSize="xsmall"
            disabled={!this.state.editMode}
            onClick={() => {
              this.props.actions.setAutomationMode(polygon, false)
                .then(({payload}) => this.addEditedPolygon(payload));
            }}
          >Deactivate</Button>
        </div>
      );
    } else {
      content = (
        <div>
          <div><i>inactive</i></div>
          <Button
            bsStyle="primary"
            bsSize="xsmall"
            disabled={!this.state.editMode}
            onClick={() => {
              this.props.actions.setAutomationMode(polygon, true)
                .then(({payload}) => this.addEditedPolygon(payload));
            }}
          >Activate</Button>
        </div>
        );
    }
    return content;
  }

  renderAvailCarsPerCategory(polygon) {
    const {carCategoriesAvailableCars = []} = polygon;

    const indents = [];

    const carTypes = Object.entries(this.buildSortedCarCategories(carCategoriesAvailableCars));
    carTypes.forEach(([key, value]) => {
      indents.push(<tr><td>val: </td><td>
        <Col
          className={'table-row-select'}
        >
          <span>
            {value}
          </span>
        </Col>
      </td><td>{key}</td></tr>);
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
   );
  }

  renderAcceptedPerCategory(polygon) {
    const {carCategoriesAcceptedRides = []} = polygon;
    const carTypes = Object.entries(this.buildSortedCarCategories(carCategoriesAcceptedRides));
    const indents = [];
    carTypes.forEach(([key, value]) => {
      indents.push(<tr><td>val: </td><td>
        <Col
          className={'table-row-select'}
        >
          <span>
            {value}
          </span>
        </Col>
      </td><td>{key}</td></tr>);
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
   );
  }

  renderEyeballsPerCategory(polygon) {
    const {carCategoriesNumberOfEyeballs = []} = polygon;
    const carTypes = Object.entries(this.buildSortedCarCategories(carCategoriesNumberOfEyeballs));
    const indents = [];
    carTypes.forEach(([key, value]) => {
      indents.push(<tr><td>val: </td><td>
        <Col
          className={'table-row-select'}
        >
          <span>
            {value}
          </span>
        </Col>
      </td><td>{key}</td></tr>);
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
   );
  }

  renderMissedPerCategory(polygon) {
    const {carCategoriesRequestedRides = []} = polygon;
    const carTypes = Object.entries(this.buildSortedCarCategories(carCategoriesRequestedRides));
    const indents = [];
    carTypes.forEach(([key, value]) => {
      indents.push(<tr><td>val: </td><td>
        <Col
          className={'table-row-select'}
        >
          <span>
            {value}
          </span>
        </Col>
      </td><td>{key}</td></tr>);
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
    );
  }

  renderCarsPerCategory(polygon) {
    const {carCategoriesCars = []} = polygon;
    const carTypes = Object.entries(this.buildSortedCarCategories(carCategoriesCars));
    const indents = [];
    carTypes.forEach(([key, value]) => {
      indents.push(<tr><td>val: </td><td>
        <Col
          className={'table-row-select'}
        >
          <span>
            {value}
          </span>
        </Col>
      </td><td>{key}</td></tr>);
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
   );
  }

  renderSuggestedSurgeFactor(polygon) {
    const {recommendedSurgeMapping = []} = polygon;
    const carTypes = Object.entries(this.buildSortedCarCategories(recommendedSurgeMapping));
    let className = '';
    if (!polygon.automated) {
      className = 'text-muted';
    }
    const indents = [];
    carTypes.forEach(([key, value]) => {
      indents.push(<tr><td className="text-muted">val: </td><td>
        <Col
          className={className}
        >
          <span>
            {value.toFixed(2)}
          </span>
        </Col>
      </td><td className={className}>{key}</td></tr>);
    });

    return (
      <table className="table table-striped table-condensed">
        <tbody>
          {indents}</tbody>
      </table>
   );
  }

  renderCarCategoriesCheckboxes(polygon) {
    const {carCategories = []} = polygon;
    const carTypes = _.get(this.props.common, 'carTypesMap.allItems');
    if (carTypes) {
      return (
        <FormGroup className="bottom0">
          {_.map(carTypes, ({carCategory}) =>
            <Checkbox
              inline
              onChange={() => {
                const newCarCategories = _.xor(carCategories, [carCategory]);
                if (newCarCategories.length > 0) {
                  const newPolygon = Object.assign({}, polygon, {carCategories: newCarCategories});
                  this.props.actions.updateCarCategories(newPolygon)
                  .then(({payload}) => {
                    this.addEditedPolygon(payload);
                  });
                } else {
                  this.props.actions.showNotification('There should be at least one car category selected');
                }
              }}
              checked={carCategories.indexOf(carCategory) > -1} disabled={!this.state.editMode}
            >{carCategory}</Checkbox>)}
        </FormGroup>
      );
    }
    return false;
  }

  renderSurgeFactorSelect({surgeFactor, carCategories, id}) {
    const isDisabled = _.isEmpty(carCategories);
    const style = {
      cursor: isDisabled ? 'default' : 'pointer',
      opacity: isDisabled ? 0.65 : 1,
      color: isDisabled ? '#5d5d5d' : '#158cba',
    };
    return (
      <Col
        className={`table-row-select ${isDisabled ? 'disabled' : ''}`}
        onClick={(event) => {
          if (!isDisabled) {
            const options = {
              disabled: isDisabled,
              id,
              x: event.nativeEvent.layerX - event.nativeEvent.offsetX,
              y: event.nativeEvent.layerY - event.nativeEvent.offsetY,
            };
            this.setState({options});
          }
        }}
      >
        <span
          className={isDisabled ? '' : 'pointer'}
          style={style}
        >{isDisabled ? '1.00' : surgeFactor.toFixed(2)}
        </span>
      </Col>
    );
  }

  renderTable() {
    const polygons =
      _.chain(this.props.surgePricing)
        .get('polygons')
        .filter((row) => {
          const filter = this.state.filter || '';
          return row.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        })
        .value();
    return (
      <PaginatedTable
        loading={this.props.surgePricing.loading}
        data={this.mapTableRows(polygons)}
        className="polygon-table"
        serverResponse={this.props.surgePricing}
        sortable={this.state.sortable}
        onSortChange={(e, {sort}) => {
          this.setState({tableSort: sort});
          this.props.actions.sort(sort);
        }}
        ref={(ref) => {
          if (_.get(ref, 'tableConfig')) {
            this.tableConfig = ref.tableConfig;
          }
        }}
        onRowClick={tableRow => this.onRowClick(tableRow)}
        onHeaderClick={tableRow => this.onRowClick(tableRow)}
        defaultSort={this.state.tableSort}
      />
    );
  }

  renderPolygonMap() {
    return (
      <PolygonMap
        polygons={this.props.surgePricing.polygons}
        ref={(ref) => { this.polygonMap = ref; }}
        height={'300px'}
        onCreatePolygon={(polygon) => {
          this.setState({newPolygon: polygon, showAddNewPolygonModal: true});
        }}
        onEditPolygon={polygon => this.onEditPolygon(polygon)}
        onDeletePolygon={({raData}) => this.props.actions.removeSurgePricing(raData)}
      />
    );
  }

  renderFilterName() {
    return (
      <Well bsSize="small">
        <FormGroup
          controlId="FormControlName"
          bsSize={'small'}
          className="bottom0"
        >
          <FormControl
            type="text"
            value={this.state.filter}
            onChange={({target: {value: filter}}) => this.setState({filter})}
            placeholder="Find Surge Area by Name"
          />
        </FormGroup>
      </Well>
    );
  }

  renderAddPolygonModal() {
    if (this.state.newPolygon) {
      return (
        <AddPolygonModal
          show={this.state.showAddNewPolygonModal}
          polygon={this.state.newPolygon}
          onCancelNewPolygon={() =>
            this.setState({newPolygon: null, showAddNewPolygonModal: false})}
          onSaveNewPolygon={(polygon) => {
            this.setState({newPolygon: null, showAddNewPolygonModal: false});
            this.onAddPolygon(polygon);
          }}
        />
      );
    }
    return false;
  }

  renderEditModeButton() {
    const editButton = (<EditModeButton
      onEdit={() => {
        this.onEditMode();
      }}
      onSave={() => {
        this.onSaveEdition(this.state.editedPolygons);
      }}
      onCancel={() => {
        this.onCancelEdition();
      }}
      editMode={this.state.editMode}
    />);

    return (<div className="inline-block" style={{float: 'right'}}>
      {editButton}</div>
    );
  }

  renderGlobalButtons() {
    const changeSurgeAreaMode = (<SplitButton id="changeSurgeAreaMode" bsStyle="primary" title={this.pfMode.title}>
      {_.map(this.pfMode.options, option => <MenuItem id={option.id} key={option.id} eventKey="1" onClick={pfMode => this.handleSwitchPFMode(pfMode)}>{option.name}</MenuItem>)}
    </SplitButton>);
    const surgeAreaText = <h4 className="inline-block actual-mode">Actual mode: {this.props.surgePricing.currentPfMode}</h4>;
    const editButton = this.renderEditModeButton();
    return (<form className="form-inline" role="form">{changeSurgeAreaMode}
      {surgeAreaText}
      {editButton}
    </form>);
  }

  render() {
    return (
      <section className="surgePricing">
        <PropsWatcher prop="common.selectedCity" handler={cityId => this.handleLoad({cityId})} />
        {this.renderPolygonMap()}
        {this.renderFilterName()}
        {this.renderGlobalButtons()}
        {this.renderTable()}
        {this.renderAddPolygonModal()}
        {this.state.options &&
          <Options
            {...this.state.options}
            options={this.getSurgeOptions()}
            onChange={({option, id, carCategory}) => {
              const polygons = this.props.surgePricing.polygons.slice();
              const polygonIndex = _.findIndex(polygons, {id});
              if (polygonIndex > -1) {
                const polygon = polygons[polygonIndex];
                polygon.carCategoriesFactors[carCategory] = option.id;
                polygon.surgeFactors = polygon.carCategoriesFactors;
                polygon.surgeFactor = option.id;
                if (!this.state.editMode) this.props.actions.updateSurgePricing(polygon); else {
                  this.addEditedPolygon(polygon);
                }
              }
            }}
          />
        }
      </section>
    );
  }
}


export default cssModules(SurgePricing, styles);

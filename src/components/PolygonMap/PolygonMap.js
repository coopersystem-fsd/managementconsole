import React, { Component } from 'react';
import _ from 'lodash';
import {ButtonToolbar, Button, ListGroup, ListGroupItem} from 'react-bootstrap';
import cssModules from 'react-css-modules';

import styles from './PolygonMap.scss';
import ConfirmModal from '../ConfirmModal';

const CONSTANTS = {
  map: {
    options: {
      zoom: 10,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      center: {
        lat: 30.267153,
        lng: -97.743061,
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    },
    style: {
      height: 'calc(90vh - 100px)',
      width: '100%',
    },
  },
  drawManager: {
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon'],
    },
    polygonOptions: {
      draggable: true,
      fillOpacity: 0.2,
      strokeWeight: 5,
      clickable: true,
      editable: true,
      zIndex: 1,
    },
  },
};

class PolygonMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
    };
    this.addPolygon = this.addPolygon.bind(this);
    this.onToggleEditMode = this.onToggleEditMode.bind(this);
    this.onDeletePolygon = this.onDeletePolygon.bind(this);
    this.addPolygonEvents = this.addPolygonEvents.bind(this);
    this.onSetData = this.onSetData.bind(this);
    this.onRefreshPolygons = this.onRefreshPolygons.bind(this);
    this.onEditPolygon = this.onEditPolygon.bind(this);
    this.onTogglePolygonEditMode = this.onTogglePolygonEditMode.bind(this);
    this.onCancelPolygonChanges = this.onCancelPolygonChanges.bind(this);
    this.onSavePolygonChanges = this.onSavePolygonChanges.bind(this);
    this.onMoveLabel = this.onMoveLabel.bind(this);
    this.onToggleMarkers = this.onToggleMarkers.bind(this);
    this.getSelectedPolygon = this.getSelectedPolygon.bind(this);
  }

  componentWillMount() {
    if (!google.maps.Polygon.prototype.getBounds) {
      google.maps.Polygon.prototype.getBounds = function () {
        const bounds = new google.maps.LatLngBounds();
        this.getPath().forEach((element) => { bounds.extend(element); });
        return bounds;
      };
    }
    this.onSetData();
  }

  componentDidMount() {
    const {map, drawManager} = CONSTANTS;
    this.map = new google.maps.Map(document.getElementById('map'), map.options);
    if (this.props.lat && this.props.lng) {
      this.map.panTo(this.setCenter(this.props.lat, this.props.lng));
    }
    this.drawingManager = new google.maps.drawing.DrawingManager(drawManager);
    this.overlay = new google.maps.OverlayView();
    this.overlay.draw = function () {};
    this.overlay.setMap(this.map);

    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', this.addPolygon);
    google.maps.event.addListener(this.map, 'click', () => {
      this.setState({popover: null});
    });
    google.maps.event.addListener(this.map, 'mousemove', () => {
      if (this.polygons) {
        _.chain(this.polygons)
          .filter(({infoWindow}) => infoWindow)
          .forEach(({infoWindow}) => infoWindow.setMap(null))
          .value();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.onSetData(nextProps);
  }

  onSetData(nextProps) {
    const props = nextProps || this.props;
    const { polygons } = props;

    if (polygons) {
      this.setState({polygons}, this.onRefreshPolygons);
    }
  }

  onRefreshPolygons({polygons} = this.state) {
    if (_.isEmpty(polygons)) return;
    const polygonIds =
      _.chain(polygons)
        .map(({id}) => id)
        .value();

    const oldPolygonIds =
      _.chain(this.polygons)
        .map(({id}) => id)
        .value();

    const newPolygonIds = _.filter(polygonIds, id => oldPolygonIds.indexOf(id) === -1);
    const deletePolygonsIds = _.filter(oldPolygonIds, id => polygonIds.indexOf(id) === -1);
    const updatePolygonsIds = _.filter(polygonIds, id => oldPolygonIds.indexOf(id) > -1);
    this.handleRemovePolygons(this.polygons, deletePolygonsIds);
    this.polygons = _.filter(this.polygons, ({id}) => deletePolygonsIds.indexOf(id) === -1);

    const newPolygons = this.handleAddPolygons(polygons, newPolygonIds);

    this.polygons = this.handleUpdatePolygons(polygons, updatePolygonsIds);

    this.polygons = [...this.polygons, ...newPolygons];
  }

  onCancelPolygonChanges() {
    const selectedPolygon = this.onTogglePolygonEditMode(false);
    this.onToggleMarkers(true);
    this.setState({selected: null});

    if (selectedPolygon.newPolygon) {
      selectedPolygon.setMap(null);
    } else if (selectedPolygon.moveLabel) {
      selectedPolygon.marker.setOptions({position: selectedPolygon.marker.oldPosition});
      selectedPolygon.marker.setDraggable(false);
    } else {
      selectedPolygon.setOptions({paths: selectedPolygon.oldPosition});
    }

    selectedPolygon.moveLabel = null;
    selectedPolygon.selected = false;
    selectedPolygon.oldPosition = null;
    if (selectedPolygon.marker) selectedPolygon.marker.oldPosition = null;
  }

  onSavePolygonChanges() {
    const selectedPolygon = this.getSelectedPolygon() || this.newPolygon;
    if (this.getPolygonPath(selectedPolygon).length < 3) return;
    this.onTogglePolygonEditMode(false);
    const {lat, lng} = this.getPolygonCenter(selectedPolygon);
    Object.assign(selectedPolygon, this.getBounds(selectedPolygon));

    selectedPolygon.centerPointLat = lat();
    selectedPolygon.centerPointLng = lng();
    selectedPolygon.paths = this.getPolygonPath(selectedPolygon);
    selectedPolygon.selected = false;
    selectedPolygon.oldPosition = null;

    if (selectedPolygon.marker) selectedPolygon.marker.setDraggable(false);

    if (!selectedPolygon.moveLabel && selectedPolygon.marker) {
      selectedPolygon.marker.setPosition(
        {lat: selectedPolygon.centerPointLat, lng: selectedPolygon.centerPointLng});
    }

    selectedPolygon.moveLabel = false;
    selectedPolygon.editPolygon = false;
    this.onToggleMarkers(true);

    if (selectedPolygon.newPolygon) {
      this.props.onCreatePolygon(selectedPolygon);
    } else {
      this.props.onEditPolygon(selectedPolygon);
    }
    this.setState({selected: null});
  }

  onEditPolygon() {
    this.onTogglePolygonEditMode(true);
    this.getSelectedPolygon().marker.setMap(null);
  }

  onToggleMarkers(state) {
    _.forEach(this.polygons, ({marker}) => {
      if (marker) marker.setMap(state ? this.map : null);
    });
  }

  onTogglePolygonEditMode(editState) {
    const selectedPolygon = this.getSelectedPolygon() || this.newPolygon;
    if (selectedPolygon.infoWindow) selectedPolygon.infoWindow.setMap(null);
    selectedPolygon.editPolygon = true;

    if (editState && !selectedPolygon.newPolygon) {
      selectedPolygon.oldPosition = this.getPolygonPath(selectedPolygon);
    }

    selectedPolygon.setOptions({draggable: editState, editable: editState});
    this.setState({popover: null, editPolygonMode: editState});
    return selectedPolygon;
  }

  onToggleEditMode() {
    const {editMode} = this.state;
    const newState = !editMode;
    this.setState({editMode: newState});

    this.drawingManager.setMap(newState ? this.map : null);

    if (!newState) {
      _.forEach(this.polygons, (polygon) => {
        polygon.setEditable(newState);
        polygon.setDraggable(newState);
      });
    }
  }

  onDeletePolygon() {
    const polygonToBeDeleted = _.find(this.polygons, {id: this.state.selected});
    polygonToBeDeleted.setMap(null);
    polygonToBeDeleted.marker.setMap(null);
    this.props.onDeletePolygon(polygonToBeDeleted);
    this.setState({confirm: false});
  }

  onMoveLabel() {
    this.setState({popover: null, editPolygonMode: true});
    const selectedPolygon = this.getSelectedPolygon();
    selectedPolygon.marker.setDraggable(true);
    selectedPolygon.moveLabel = true;
    selectedPolygon.infoWindow.setMap(null);
    const {lat, lng} = selectedPolygon.marker.getPosition();
    selectedPolygon.marker.oldPosition = {lat: lat(), lng: lng()};

    selectedPolygon.marker.addListener('dragend', function (event) {
      const isOverlapping =
        google.maps.geometry.poly.containsLocation(event.latLng, selectedPolygon);
      if (!isOverlapping) {
        this.setPosition(selectedPolygon.marker.oldPosition);
      }
    });
  }

  setCenter(lat, lng) {
    if (lat && lng) this.map.panTo(new google.maps.LatLng(lat, lng));
  }

  getEdits(polygons) {
    const isEditIds =
      _.chain(polygons)
        .filter(({editPolygon}) => editPolygon)
        .map(({id}) => id)
        .value();

    const isEdits =
      _.chain(polygons)
        .filter(({editPolygon}) => editPolygon)
        .value();

    return {isEditIds, isEdits};
  }

  getBounds(polygon) {
    const {
      f: {b: bottomRightCornerLat, f: topLeftCornerLat},
      b: {b: bottomRightCornerLng, f: topLeftCornerLng},
    } = polygon.getBounds();
    return {bottomRightCornerLat, topLeftCornerLat, bottomRightCornerLng, topLeftCornerLng};
  }

  getPolygonPath(polygon) {
    if (polygon) {
      return _.map(polygon.getPath().getArray(), ({lat, lng}) => ({lat: lat(), lng: lng()}));
    }
    return false;
  }

  getSVGLabel(label) {
    return `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%23808080%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%22.5%22%20d%3D%22M34.305%2016.234c0%208.83-15.148%2019.158-15.148%2019.158S3.507%2025.065%203.507%2016.1c0-8.505%206.894-14.304%2015.4-14.304%208.504%200%2015.398%205.933%2015.398%2014.438z%22%2F%3E%3Ctext%20transform%3D%22translate%2819%2018.5%29%22%20fill%3D%22%23fff%22%20style%3D%22font-family%3A%20Arial%2C%20sans-serif%3Bfont-weight%3Abold%3Btext-align%3Acenter%3B%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%3E${label}%3C%2Ftext%3E%3C%2Fsvg%3E`;
  }

  getPolygonCenter(polygon) {
    const bounds = new google.maps.LatLngBounds();
    const paths = this.getPolygonPaths(polygon);

    _.forEach(paths, path => bounds.extend(path));

    return bounds.getCenter();
  }

  getPolygonPaths(polygon) {
    return polygon.latLngs.getArray()[0].getArray();
  }

  getSelectedPolygon() {
    return _.find(this.polygons, ({id}) => _.toNumber(id) === _.toNumber(this.state.selected));
  }

  getOverlapping(polygons, event) {
    return _.chain(polygons)
      .filter(p => google.maps.geometry.poly.containsLocation(event.latLng, p))
      .map((p) => {
        p.area = google.maps.geometry.spherical.computeArea(p.getPath());
        return p;
      })
      .sortBy(({area}) => area)
      .first()
      .value();
  }

  addPolygonEvents(polygon) {
    const that = this;
    const handleMouseOver = (e) => {
      _.chain(this.polygons)
        .filter(p => p.infoWindow)
        .forEach(p => p.infoWindow.setMap(null))
        .filter(p => google.maps.geometry.poly.containsLocation(e.latLng, p))
        .forEach(p => p.infoWindow.setMap(that.map))
        .value();

      const selectedPolygonInfoWindow = _.get(this.getSelectedPolygon(), 'infoWindow');
      if (this.state.editPolygonMode && selectedPolygonInfoWindow) {
        selectedPolygonInfoWindow.setMap(null);
      }
    };

    function handleRightClick(event) {
      if (!that.state.editPolygonMode) {
        const projection = that.overlay.getProjection().fromLatLngToContainerPixel(event.latLng);
        const newstate = {popover: projection};

        const overlapping = that.getOverlapping(that.polygons, event);

        if (overlapping) {
          newstate.selected = overlapping.id;
        } else {
          newstate.selected = this.id;
        }
        that.setState(newstate);
      }
    }

    google.maps.event.addListener(polygon.marker, 'mouseover', handleMouseOver);
    google.maps.event.addListener(polygon, 'mouseover', handleMouseOver);

    google.maps.event.addListener(polygon, 'click', () => {
      this.setState({popover: null});
    });

    google.maps.event.addListener(polygon, 'rightclick', handleRightClick);
    google.maps.event.addListener(polygon.marker, 'rightclick', handleRightClick);
    google.maps.event.addListener(polygon.infoWindow, 'rightclick', handleRightClick);
  }

  addPolygon({overlay: polygon}) {
    polygon.selected = true;
    polygon.newPolygon = true;
    polygon.editPolygon = true;
    // polygon.id = _.uniqueId();

    const detectPathChange = () => this.setState({polygonChanged: true});
    polygon.getPaths().forEach((path) => {
      google.maps.event.addListener(path, 'insert_at', detectPathChange);
      google.maps.event.addListener(path, 'remove_at', detectPathChange);
      google.maps.event.addListener(path, 'set_at', detectPathChange);
    });

    this.drawingManager.setMap(null);
    this.onToggleEditMode();
    if (!this.polygons) this.polygons = [polygon];
    this.polygons.push(polygon);
    this.newPolygon = polygon;
    this.setState({editPolygonMode: true});
  }

  clearPolygons() {
    if (this.polygons) {
      _.forEach(this.polygons, (p) => {
        if (!p.newPolygon) p.setMap(null);
        if (p.marker) p.marker.setMap(null);
        if (p.infoWindow) p.infoWindow.setMap(null);
      });
    }
  }

  handleRemovePolygons(polygons, ids) {
    if (polygons) {
      _.forEach(polygons, (p) => {
        if (p.editPolygon) return;
        if (ids.indexOf(p.id) > -1) {
          if (!p.newPolygon) p.setMap(null);
          if (p.marker) p.marker.setMap(null);
          if (p.infoWindow) p.infoWindow.setMap(null);
        }
      });
    }
  }

  handleUpdatePolygons(polygons, ids) {
    const {isEditIds, isEdits} = this.getEdits(this.polygons);
    return _.chain(this.polygons)
      .filter(({id}) => isEditIds.indexOf(id) === -1)
      .filter(({id}) => ids.indexOf(id) > -1)
      .map((polygon) => {
        const newPolygon = _.find(polygons, {id: polygon.id});
        if (newPolygon) {
          polygon.infoWindow.setPosition(this.getPolygonCenter(polygon));
          const content = `<div id="content">${newPolygon.numberOfEyeballs}: ${newPolygon.name || newPolygon.id}: x${newPolygon.surgeFactor.toFixed(2)}</div>`;
          polygon.infoWindow.setContent(content);
          polygon.setOptions({
            strokeColor: newPolygon.strokeColor,
            strokeOpacity: newPolygon.strokeOpacity,
            strokeWeight: newPolygon.strokeWeight,
            fillColor: newPolygon.fillColor,
            fillOpacity: newPolygon.fillOpacity,
          });
          polygon.marker.setIcon(this.getSVGLabel(newPolygon.surgeFactor.toFixed(2)));
        }
        return polygon;
      })
      .concat(isEdits)
      .value();
  }

  handleAddPolygons(polygons, ids) {
    const {isEditIds, isEdits} = this.getEdits(this.polygons);

    return _.chain(polygons)
      .filter(({id}) => isEditIds.indexOf(id) === -1)
      .filter(({id}) => ids.indexOf(id) > -1)
      .map((polygon) => {
        const paths = polygon.paths.map(({lat, lng}) => new google.maps.LatLng(lat, lng));
        const newPolygon = new google.maps.Polygon({
          paths,
          strokeColor: polygon.strokeColor,
          strokeOpacity: polygon.strokeOpacity,
          strokeWeight: polygon.strokeWeight,
          fillColor: polygon.fillColor,
          fillOpacity: polygon.fillOpacity,
          raData: polygon,
          id: polygon.id,
          map: this.map,
          draggable: false,
          editable: false,
        });

        const isDisabled = (!polygon.carCategories || !polygon.carCategories.length);
        const surgeFactor = isDisabled ? 1 : polygon.surgeFactor;
        const latLng = new google.maps.LatLng(polygon.centerPointLat, polygon.centerPointLng);
        const labelPostition =
          (polygon.labelLat && polygon.labelLng) ?
            {lat: polygon.labelLat, lng: polygon.labelLng} : latLng;

        newPolygon.marker = new google.maps.Marker({
          position: labelPostition,
          map: this.map,
          opacity: polygon.markerOpacity,
          icon: this.getSVGLabel(surgeFactor.toFixed(2)),
          id: polygon.id,
          surgeFactor,
          draggable: false,
        });

        const content = `<div id="content">${polygon.numberOfEyeballs}: ${polygon.name || polygon.id}: x${surgeFactor.toFixed(2)}</div>`;
        newPolygon.infoWindow = new google.maps.InfoWindow({
          content,
          position: latLng,
          pixelOffset: new google.maps.Size(0, -15),
          id: polygon.id,
          disableAutoPan: true,
          closeBoxURL: '',
        });

        this.addPolygonEvents(newPolygon);
        return newPolygon;
      })
      .concat(isEdits)
      .value();
  }

  renderMap() {
    if (this.props.height) CONSTANTS.map.style.height = this.props.height;
    return (
      <div id="map" style={CONSTANTS.map.style} />
    );
  }

  renderAddPolygonButton() {
    const {editMode, editPolygonMode} = this.state;
    const buttons = [];
    const polygon = this.getSelectedPolygon() || this.newPolygon;
    if (editPolygonMode) {
      buttons.push(
        <Button
          disabled={this.getPolygonPath(polygon).length < 3}
          key={_.uniqueId()}
          bsStyle={'primary'}
          onClick={this.onSavePolygonChanges}
        >Save Polygon Changes</Button>,
        <Button
          key={_.uniqueId()}
          bsStyle={'danger'}
          onClick={this.onCancelPolygonChanges}
        >Cancel</Button>);
      if (this.getPolygonPath(polygon).length < 3) {
        buttons.push(<Button bsStyle="link" disabled>Polygon needs to have at least 3 nodes</Button>);
      }
    } else {
      buttons.push(<Button
        key={_.uniqueId()}
        bsStyle={'primary'}
        onClick={this.onToggleEditMode}
      >{editMode ? 'Disable Edit Mode' : 'Create Polygon'}</Button>);
    }

    return (
      <ButtonToolbar className="bottom10">
        {buttons}
      </ButtonToolbar>
    );
  }

  renderPopOver({popover} = this.state) {
    if (popover) {
      const {x, y} = popover;
      return (
        <aside className="polygon-popover" style={{top: `${y + 50}px`, left: `${x + 20}px`}}>
          <ListGroup>
            <ListGroupItem onClick={this.onEditPolygon}>
              Edit Polygon
            </ListGroupItem>
            <ListGroupItem onClick={this.onMoveLabel}>
              Move Label
            </ListGroupItem>
            <ListGroupItem onClick={() => this.setState({popover: null, confirm: true})}>
              Delete Polygon
            </ListGroupItem>
          </ListGroup>
        </aside>
      );
    }
    return false;
  }

  renderConfirmBox({confirm} = this.state) {
    if (confirm) {
      return (
        <ConfirmModal
          show={!!confirm}
          title={'Are you sure you want to delete the polygon?'}
          onYesClick={this.onDeletePolygon}
          onNoClick={() => {
            _.forEach(this.polygons, (polygon) => {
              if (polygon.selected) {
                polygon.selected = false;
              }
            });
            this.setState({confirm: false, selectedPolygon: null});
          }}
        />
      );
    }
    return false;
  }

  render() {
    return (
      <section className="polygonMap">
        {this.renderMap()}
        {this.renderConfirmBox()}
      </section>
    );
  }
}

export default cssModules(PolygonMap, styles);

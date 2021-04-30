import React, { Component, PropTypes } from 'react';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Col,
  Row,
  Button,
  ButtonToolbar,
} from 'react-bootstrap';
import Car from './Car';
import CarDocuments from './CarDocuments';
import AddCarModal from './AddCarModal';
import Loading from '../Loading';

require('react-datepicker/dist/react-datepicker.css');

class Profile extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    user: PropTypes.object.isRequired,
    carTypes: PropTypes.object.isRequired,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
    cars: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      showAddCarModal: false,
    };
  }

  componentWillMount() {
    this.setData();

    this.debounceSave = _.debounce(this.onSave, 500);

    if (this.props.user.cars.length > 0) {
      const carId =
      _.chain(this.props.user.cars)
        .sortBy(['removed', 'make', 'selected'])
        .last()
        .get('id')
        .toNumber()
        .value();
      const carDocument = _.find(this.props.user.carDocuments, {carId});
      if (!carDocument) {
        this.props.onCarSelect(carId);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onSave() {
    if (this.handleFormValidation()) return;
    const car = Object.assign({},
      this.state.car,
      this.car.getCar(),
      {carId: this.state.car.id, driverId: this.state.user.id});
    delete car.inspectionSticker;
    this.props.onSaveCar(car);
  }

  onDelete() {
    const car = Object.assign({},
      this.state.car,
      this.car.getCar(),
      {carId: this.state.car.id, driverId: this.state.user.id});
    this.props.onDeleteCar(car);
  }

  onSelectCar(selectedCar) {
    const car = this.setCar(_.toNumber(selectedCar), this.state.user.cars);
    if (this.car) {
      this.car.setState({fields: null});
    }
    this.carDocuments.setState({fields: null});
    this.setState({selectedCar, car});
    this.props.onCarSelect(selectedCar);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user, carDocuments} = props;
    const state = {user, carDocuments};

    if (user.cars.length > 0) {
      state.selectedCar = this.state.selectedCar ?
        _.toNumber(this.state.selectedCar) :
        _.chain(user.cars)
          .sortBy(['removed', 'make', 'selected'])
          .last()
          .get('id')
          .toNumber()
          .value();
      state.car = this.setCar(state.selectedCar, user.cars);
    }

    this.setState(state);
  }

  setCar(newCar, cars) {
    return _.chain(cars)
      .filter(({id}) => id === newCar)
      .first()
      .value();
  }

  handleFormValidation() {
    if (this.car) {
      return this.car.isFieldInvalid();
    }
    return true;
  }

  renderCarSelect() {
    if (this.state.car) {
      return (
        <Col sm={6}>
          <Form horizontal>
            <FormGroup controlId="formControlsSelect">
              <Col componentClass={ControlLabel} sm={2}>Car</Col>
              <Col sm={10}>
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  value={this.state.car.id}
                  onChange={({target: {value: selectedCar}}) => {
                    this.onSelectCar(selectedCar);
                  }}
                >{_.chain(this.state.user.cars)
                    .sortBy(['removed', 'make', 'selected'])
                    .map(car =>
                      <option key={`car-select-${car.id}`} value={car.id}>{car.make} {car.model} {car.removed ? '[REMOVED]' : ''}</option>)
                    .value()}
                </FormControl>
              </Col>
            </FormGroup>
          </Form>
        </Col>
      );
    }
    return false;
  }

  renderCar() {
    if (this.state.car) {
      return (
        <Car
          ref={(ref) => { this.car = ref; }}
          car={this.state.car}
          carTypes={this.props.carTypes.allItems}
          onChange={() => {
            const car = Object.assign({}, this.state.car);
            this.setState({car}, () => this.debounceSave());
          }}
        />
      );
    }
    return false;
  }

  renderCarDocuments() {
    const carDocuments = _.chain(this.state.carDocuments)
      .filter(doc => this.state.car.id === doc.carId)
      .first()
      .value();
    if (this.state.car && carDocuments) {
      return (
        <CarDocuments
          ref={(ref) => { this.carDocuments = ref; }}
          car={this.state.car}
          user={this.state.user}
          onChangeCar={car => this.props.onSaveCar(car)}
          onChangeDocument={(newDocument) => {
            newDocument.driverId = this.state.user.id;
            this.props.onChangeDocument(newDocument);
          }}
          carDocuments={carDocuments}
        />
      );
    }
    return <Loading loading height="250px" />;
  }

  renderAddCarModal() {
    if (this.state.showAddCarModal) {
      return (
        <AddCarModal
          show={this.state.showAddCarModal}
          carTypes={this.props.carTypes.allItems}
          onSave={(newCar) => {
            this.props.onAddCar(newCar);
            this.setState({showAddCarModal: false}, () => {
              this.onSelectCar(this.state.selectedCar);
            });
          }}
          onCancel={() => {
            this.setState({showAddCarModal: false}, () => {
              this.onSelectCar(this.state.selectedCar);
            });
          }}
        />
      );
    }
    return false;
  }

  render() {
    return (
      <div className="cars">
        <Row>
          {this.renderCarSelect()}
          <Col sm={6}>
            <ButtonToolbar className="pull-right">
              <Button
                onClick={() => this.setState({showAddCarModal: true})}
              >Add New Car</Button>
              {this.state.car && !this.state.car.removed &&
                <Button
                  bsStyle="danger"
                  onClick={() => this.onDelete()}
                >Delete Car</Button>}
            </ButtonToolbar>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            {this.renderCar()}
          </Col>
          <Col sm={6}>
            {this.renderCarDocuments()}
          </Col>
        </Row>
        {this.renderAddCarModal()}
      </div>
    );
  }
}

export default Profile;

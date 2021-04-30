import React, { Component, PropTypes } from 'react';
import { Form } from 'react-bootstrap';
import constants from '../../data/constants';
import FormField from '../common/FormField';
import fieldValidation from '../common/fieldValidation';

require('react-datepicker/dist/react-datepicker.css');

class Car extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    carTypes: PropTypes.array.isRequired,
    car: PropTypes.object,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
    car: {
      id: _.uniqueId(),
      isNew: true,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
    };
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    if (!this.state.fields) {
      const carMap = constants.user.car.slice();
      const carTypes = _.map(props.carTypes, ({title, carCategory}) =>
        ({id: carCategory, name: title}));
      const inspectionStatuses = _.map(constants.common.inspectionStatus, ({name, value}) =>
        ({id: value, name}));

      const fields =
      _.chain(carMap)
        .filter((field) => {
          if (props.car.isNew) return field.new;
          if (!field.onlyNew) return true;
          return false;
        })
        .map((field) => {
          field.value = props.car[field.id] || '';
          // field.rules = field.required ? isEmpty : () => null;
          field.validation = fieldValidation(field);
          if (field.id === 'carCategories') field.allValues = carTypes;
          if (field.id === 'inspectionStatus') field.allValues = inspectionStatuses;
          return field;
        })
        .value();

      this.setState({fields});
    }
  }

  getCar() {
    const car = Object.assign({}, this.props.car);
    _.forEach(this.state.fields, (field) => {
      if (field.value === '') return;
      car[field.id] = field.value;
    });
    if (this.props.car.isNew) {
      delete car.id;
      delete car.isNew;
    }
    delete car.inspectionSticker;
    return car;
  }

  isFieldInvalid() {
    return Boolean(_.chain(this.state.fields)
      .map(({validation, value}) => validation(value))
      .reduce((a, b) => a + b)
      .value());
  }

  handleFormValidation() {
    return this.isFieldInvalid();
  }

  handleFieldChange(field, newValue) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    if (moment.isMoment(newValue)) {
      newValue = newValue.format(field.dateFormat);
    }
    fields[fieldIndex].value = newValue || '';
    this.setState({fields}, this.props.onChange);
  }

  renderField(field) {
    return (
      <FormField
        key={`car-${this.props.car.id}-${field.id}`}
        hasErrors={field.validation(field.value) ? 'error' : null}
        field={field}
        order={field.order}
        onChange={newValue => this.handleFieldChange(field, newValue)}
      />
    );
  }

  renderSide(side, horizontal = true) {
    if (this.state.fields) {
      return (
        <Form horizontal={horizontal} className="clearfix">
          {
            _.chain(this.state.fields)
                .map(field => this.renderField(field))
                .compact()
                .sortBy(field => field.props.order)
                .value()
          }
        </Form>
      );
    }
    return false;
  }

  render() {
    return (
      <div className="car">
        {this.renderSide('left')}
      </div>
    );
  }
}

export default Car;

import React, { Component } from 'react';
import { Col, Row, Form } from 'react-bootstrap';
import { isEmpty } from 'validator';
import constants from '../../data/constants';
import Picture from '../common/Picture';
import Box from '../common/Box';
import FormField from '../common/FormField';

require('react-datepicker/dist/react-datepicker.css');

class CarDocuments extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
    carDocuments: { carDocuments: [] },
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

  onChangePicture({field, fileData, preview, date}) {
    const validityDate =
      date ?
        date.format('YYYY-MM-DD') :
        moment.isMoment(field.validityDate) ?
          moment(field.validityDate).format(field.validityDateFormat) :
          field.validityDate;

    const newDocument = {
      driverId: this.props.user.id,
      driverPhotoType: field.id,
      documentId: field.documentId,
      fileData,
      carId: this.props.car.id,
      validityDate,
    };
    // 2.4.0 When a driver is created an insurance document is not automatically created.
    // To update insurance date without a driverDocument it's needed to update the car object.
    // This will be fixed in future versions.
    if (field.id === 'INSURANCE' && !field.documentId && date) {
      const newCar = Object.assign({},
        this.props.car,
        {
          insuranceExpiryDate: moment(date).utc().add(moment().utcOffset(), 'm').format('YYYY-MM-DD'),
          driverId: this.props.user.id,
          carId: this.props.car.id,
        });
      return this.props.onChangeCar(newCar);
    }

    return this.props.onChangeDocument(newDocument, preview);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const carMap = constants.user.carDocuments.slice();

    const fields = _.map(carMap, (f) => {
      const field = Object.assign({}, f);
      field.rules = field.required ? isEmpty : () => null;

      const carDocuments = props.carDocuments.carDocuments.slice();
      const carDocument =
        _.chain(carDocuments)
          .filter(({documentType}) => documentType === field.id)
          .last()
          .value() || {};

      field.documentId = carDocument.id;
      field.value = carDocument.documentUrl;
      field.complete = carDocument.complete;

      if (field.id === 'INSURANCE') {
        field.value = field.value ? field.value : props.car.insurancePictureUrl;
        field.validityDate =
          carDocument.validityDate ?
            moment(carDocument.validityDate) : props.car.insuranceExpiryDate;
        field.validityDateFormat = 'YYYY-MM-DD';
      }

      if (field.id === 'CAR_STICKER') {
        field.validityDate = carDocument.validityDate ? moment(carDocument.validityDate) : null;
        field.validityDateFormat = 'YYYY/MM';
      }

      return field;
    });

    this.setState({fields});
  }

  renderPhotos() {
    if (this.state.fields) {
      return (
        <Row>
          {
          _.chain(this.state.fields)
                .filter(field => !field.carPhoto)
                .map(field =>
                  <Col sm={6} key={`car-document-${this.props.car.id}-${field.id}`}>
                    <Picture
                      size="small"
                      complete={field.complete}
                      order={field.order}
                      name={field.name}
                      picture={field.value}
                      onChange={(newPicture, preview) =>
                        this.onChangePicture({field, fileData: newPicture, preview})}
                    >{field.value &&
                      <Form horizontal>
                        <FormField
                          onChange={date => this.onChangePicture({field, date})}
                          field={{
                            type: 'date',
                            name: 'Expiry Date',
                            horizontal: true,
                            value: field.validityDate,
                            dateFormat: field.validityDateFormat,
                            className: 'bottom0 top10',
                            labelSm: 5,
                            fieldSm: 6,
                          }}
                        />
                      </Form>}
                    </Picture>
                  </Col>)
                .compact()
                .sortBy(field => field.props.order)
                .value()
              }
        </Row>
      );
    }
    return false;
  }

  renderCarPhotos() {
    if (this.state.fields) {
      return (
        <Box title="Car Photos" className="topp25">
          {_.chain(this.state.fields)
                .filter(field => field.carPhoto)
                .map(field =>
                  <Col sm={6} key={`car-document-${this.props.car.id}-${field.id}`}>
                    <Picture
                      size="small"
                      complete={field.complete}
                      order={field.order}
                      name={field.name}
                      picture={field.value}
                      onChange={(newPicture, preview) =>
                        this.onChangePicture({field, fileData: newPicture, preview})}
                    />
                  </Col>)
                .compact()
                .sortBy(field => field.props.order)
                .value()}
        </Box>);
    }
    return false;
  }

  render() {
    return (
      <div className="car-documents clearfix">
        {this.renderPhotos()}
        {this.renderCarPhotos()}
      </div>
    );
  }
}

export default CarDocuments;

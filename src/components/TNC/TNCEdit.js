import React, { Component, PropTypes } from 'react';
import {
  Modal,
  Form,
  Alert,
  Col,
  Button,
  Row,
} from 'react-bootstrap';
import FormField from '../common/FormField';
import Thumbnail from './../common/Thumbnail';

class TNCEdit extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func,
    carId: PropTypes.string,
    userId: PropTypes.string,
  }

  // Default Props Value
  static defaultProps = {
    autoHide: true,
    show: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      photoData: {},
      validationResults: {},
      show: this.props.show,
    };

    this.onValueChanged = this.onValueChanged.bind(this);
    this.onSaveDocument = this.onSaveDocument.bind(this);
    this.onPhotoChanged = this.onPhotoChanged.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  // componentWillReceiveProps(newProps) {
  //
  //
  //   if ('show' in newProps) {
  //     this.setState({
  //       show: newProps.show,
  //     });
  //   }
  // }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  componentWillUnmount() {
    this.resetState();
  }

  onClose() {
    if (this.state.autoHide && this.state.show) this.setState({show: false});
    if (this.props.onClose) this.props.onClose();
    this.resetState();
  }

  onValueChanged(name, ev) {
    this.setState({ [name]: ev.target.value });
  }

  onPhotoChanged(photoData) {
    this.setState({photoData});
    const validationResults = this.state.validationResults;
    this.validatePhoto(validationResults);
    this.setState({ validationResults });
  }

  onSaveDocument() {
    if (!this.validate()) {
      return;
    }

    this.setState({ saving: true });

    const validityDate = this.state.validityDate ? this.state.validityDate.clone().format('YYYY-MM-DD') : null;

    const editingItem = this.props.editingItem || {};

    this.props.onSaveDocument({
      ...editingItem,
      userId: this.props.userId,
      carId: this.props.carId,
      driverPhotoType: this.props.driverPhotoType,
      fileData: this.state.photoData.photoData,
      validityDate,
      cityId: this.state.cityId,
    })
    .then(() => {
      this.onClose();
      this.setState({ saving: false });
    })
    .catch(() => {
      this.setState({ saving: false });
    });
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {show} = props;

    const citiesWithoutTNCCards =
      _.filter(this.props.cities, ({id}) => {
        const cardExists = _.find(this.props.items, {cityId: id});
        return !cardExists;
      });

    this.setState({
      citiesWithoutTNCCards,
      cityId: _.chain(citiesWithoutTNCCards).first().get('id').value(),
      show,
    });
  }

  resetState() {
    this.state = {
      photoData: {},
      validationResults: {},
      show: this.props.show,
    };
    this.setState(this.state);
  }

  validate() {
    let isValid = true;
    const validationResults = {};

    isValid = this.validatePhoto(validationResults) && isValid;

    this.setState({ validationResults });
    return isValid;
  }

  validatePhoto(validationResults) {
    let isValid = true;
    delete validationResults.imageData;
    if (!this.props.editingItem && !this.state.photoData.photoData) {
      isValid = false;
      validationResults.imageData = 'error';
    }
    return isValid;
  }

  render() {
    const saving = this.state.saving;
    const saveLabel = saving ? 'Saving...' : 'Save';
    const validationResults = this.state.validationResults;
    const documentUrl = this.props.editingItem && this.props.editingItem.documentUrl;

    return (
      <Modal show={this.state.show} onHide={this.onClose}>
        <Modal.Header>
          <Modal.Title>TNC Data</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Thumbnail
                onChange={this.onPhotoChanged}
                imgSource={documentUrl}
                editable={!documentUrl}
              />
              <FormField
                field={{
                  type: 'date',
                  name: 'Expiry Date',
                  id: 'validityDate',
                  dateFormat: 'YYYY-MM-DD',
                  value: this.state.validityDate,
                }}
                onChange={validityDate => this.setState({validityDate})}
              />
              <FormField
                field={{
                  id: 'city',
                  name: 'Select City',
                  type: 'select',
                  value: this.state.cityId,
                  allValues: this.state.citiesWithoutTNCCards,
                }}
                onChange={cityId => this.setState({cityId: _.toNumber(cityId)})}
              />
              <Col sm={8} smOffset={2}>
                {validationResults.imageData && <Alert bsStyle="danger" className="animated fadeIn">
                  Please select document!
                </Alert>}
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.onClose}>Cancel</Button>
          <Button onClick={this.onSaveDocument} bsStyle="primary" disabled={saving}>{saveLabel}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default TNCEdit;

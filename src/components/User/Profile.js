import React, { Component, PropTypes } from 'react';
import {
  Form,
  Col,
} from 'react-bootstrap';
import { isEmpty } from 'validator';
import Picture from '../common/Picture';
import FormField from '../common/FormField';
import fieldValidation, {validateFields} from '../common/fieldValidation';
import constants from '../../data/constants';

require('react-datepicker/dist/react-datepicker.css');

class Profile extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    user: PropTypes.object.isRequired,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
    };
  }

  componentWillMount() {
    this.setData();
    this.debounceSave = _.debounce(this.onSave, 500);
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onSave() {
    if (validateFields(this.state.fields)) return;
    const user = Object.assign({}, this.props.user);
    _.chain(this.state.fields)
      .filter(field => field.type !== 'picture')
      .forEach((field) => {
        if (field.path) {
          _.set(user, field.path, field.value);
        } else if (field.value !== '') {
          user[field.id] = field.value;
        }
      })
    .value();
    this.props.onChange(user);
  }

  onChangePicture({field, fileData, preview, date, status}) {
    const dateField = _.find(this.state.fields.slice(), {id: 'licenseExpiryDate'});
    const newDocument = {
      driverId: this.state.user.id,
      driverPhotoType: field.id,
      documentId: field.documentId,
      documentStatus: status,
      fileData,
      validityDate: date ? date.format('YYYY-MM-DD') : dateField.value,
    };

    if (date) {
      dateField.value = date.format('YYYY-MM-DD');
      this.onSave();
    }

    if (newDocument.documentId || fileData) {
      this.props.onChangeDocument(newDocument, preview, status);
    }
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user, documents, loading, updating} = props;
    const state = {
      user,
      loading,
      updating,
    };
    if (!this.state.fields) {
      state.fields =
        _.chain(constants.user.profile)
        .filter(field => field.type !== 'picture')
        .filter((field) => {
          if (field.userType) {
            return field.userType === props.user.type;
          }
          return true;
        })
        .map((field) => {
          let value;
          field.validation = fieldValidation(field);
          field.rules = field.required ? isEmpty : () => null;
          value = user[field.id] || user.user[field.id] || '';
          if (field.path) value = _.get(user, field.path);
          field.value = value;

          return field;
        })
        .value();
    }

    state.photos =
      _.chain(constants.user.profile)
      .filter(field => field.type === 'picture')
      .filter((field) => {
        if (field.userType) {
          return field.userType === props.user.type;
        }
        return true;
      })
      .map((field) => {
        field.rules = field.required ? isEmpty : () => null;
        const doc = _.chain(documents)
          .filter(({documentType}) => documentType === field.id)
          .last()
          .value() || {};
        if (field.id === 'LICENSE') {
          field.value = doc.documentUrl || props.user.licensePictureUrl;
        } else {
          field.value = doc.documentUrl;
        }
        field.documentId = doc.id;
        field.documentType = doc.documentType;
        field.complete = doc.complete;
        if (field.id === 'LICENSE' || field.id === 'CHAUFFEUR_LICENSE') {
          field.validityDate = doc.validityDate || user.licenseExpiryDate;
          field.documentStatus = doc.documentStatus;
        }
        return field;
      })
      .value();

    this.setState(state);
  }

  handleFieldChange(field, newValue) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    if (moment.isMoment(newValue)) {
      newValue = newValue.format(field.dateFormat);
    }
    fields[fieldIndex].value = newValue || '';
    this.setState({fields}, () => this.debounceSave());
  }

  renderField(field) {
    return (
      <FormField
        key={`profile-${field.id}`}
        hasErrors={field.validation(field.value) ? 'error' : null}
        field={field}
        onChange={newValue => this.handleFieldChange(field, newValue)}
      />
    );
  }

  renderProfile(side, horizontal = true) {
    if (this.state.fields) {
      return (
        <Form horizontal={horizontal} className="clearfix">
          {
            _.chain(this.state.fields)
                .filter(field => field.side === side)
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

  renderPhotos() {
    return _.chain(this.state.photos)
          .map(field =>
            <Col sm={3} key={`profile-${field.id}`}>
              <Picture
                size="small"
                complete={field.complete}
                order={field.order}
                name={field.name}
                picture={field.value}
                onChange={(fileData, preview) =>
                  this.onChangePicture({field, fileData, preview})}
              >{field.value &&
                <Form horizontal>
                  <FormField
                    onChange={date => this.onChangePicture({field, date})}
                    field={{
                      type: 'date',
                      name: 'Expiry Date',
                      horizontal: true,
                      value: field.validityDate,
                      dateFormat: 'YYYY-MM-DD',
                      className: 'bottom0 top10',
                      labelSm: 5,
                      fieldSm: 6,
                    }}
                  />
                  <FormField
                    field={{
                      type: 'select',
                      name: 'Document status',
                      horizontal: true,
                      value: field.documentStatus,
                      className: 'bottom0 top10',
                      allValues: [{ id: 'APPROVED', name: 'APPROVED' }, { id: 'PENDING', name: 'PENDING' }, { id: 'EXPIRED', name: 'EXPIRED' }, { id: 'REJECTED', name: 'REJECTED' }],
                      labelSm: 5,
                      fieldSm: 6,
                    }}
                    onChange={status => this.onChangePicture({field, status})}
                  />
                </Form>}
              </Picture>
            </Col>)
          .compact()
          .sortBy(field => field.props.order)
          .value();
  }

  render() {
    return (
      <div className="profile">
        <Col sm={12}>
          {this.renderProfile('left')}
          {this.renderPhotos()}
        </Col>
      </div>
    );
  }
}

export default Profile;

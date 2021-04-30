import React, { Component, PropTypes } from 'react';
import {
  Col,
  Row,
  ListGroupItem,
  ListGroup,
  Form,
} from 'react-bootstrap';
import FormField from '../common/FormField';
import constants from '../../data/constants';
import Loading from '../Loading';

require('react-datepicker/dist/react-datepicker.css');

class ActivationStatus extends Component { // eslint-disable-line react/prefer-stateless-function
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
    this.state = {};
  }

  componentWillMount() {
    this.setData();
    this.debounceSave = _.debounce(this.onSave, 500);
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onSave() {
    let user = Object.assign({}, this.props.user);

    _.forEach(this.state.fields, (field) => {
      if (field.id === 'activationStatus') {
        const isActive = field.value === 'ACTIVE';
        user[field.id] = field.value;
        user.active = isActive;
      }
      if (field.id === 'flags') {
        _.forEach(field.allValues, (checkbox) => {
          const isChecked = field.value.indexOf(checkbox.id) > -1;
          if (checkbox.id === 'womenOnly') {
            user.grantedDriverTypes = this.setWomanOnly(isChecked, user);
          } else if (checkbox.id === 'deafDriver') {
            user.specialFlags = this.setDeafDriver(isChecked, user);
          } else if (checkbox.path) {
            user = _.set(user, checkbox.path, isChecked);
          } else {
            user[checkbox.id] = isChecked;
          }
        });
      } else {
        user[field.id] = field.value;
      }
    });

    this.props.onChange(user);
  }

  setWomanOnly(bool, user) {
    return _.chain([user])
      .map((u) => {
        if (bool) {
          _.uniq(u.grantedDriverTypes.push('WOMEN_ONLY'));
        } else {
          u.grantedDriverTypes = u.grantedDriverTypes.filter(type => type !== 'WOMEN_ONLY');
        }
        return u.grantedDriverTypes;
      })
      .first()
      .value();
  }

  setDeafDriver(bool, user) {
    return _.chain([user])
      .map((u) => {
        if (bool) {
          _.uniq(u.specialFlags.push('DEAF'));
        } else {
          u.specialFlags = u.specialFlags.filter(type => type !== 'DEAF');
        }
        return u.specialFlags;
      })
      .first()
      .value();
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    if (_.isEmpty(props.user)) {
      this.setState({user: {}});
    }
    if (!this.state.fields && !_.isEmpty(props.user)) {
      const carMap = constants.user.activationStatus.slice();
      const fields =
      _.chain(carMap)
        .filter((value) => {
          if (value.userType) {
            return value.userType === props.user.type;
          }
          return true;
        })
        .map((f) => {
          const field = Object.assign({}, f);
          field.value = props.user[field.id] || '';
          if (field.id === 'activationStatus') field.allValues = constants.common.activationStatus;
          if (field.id === 'cityApprovalStatus') field.allValues = constants.common.cityApprovalStatus;
          if (field.id === 'flags') {
            field.allValues =
              _.filter(field.allValues.slice(), (value) => {
                if (value.userType) {
                  return value.userType === props.user.type;
                }
                return true;
              });

            field.value =
            _.chain(field.allValues)
              .map(({id, path}) => {
                if (id === 'womenOnly' && this.isWomenOnly(props.user)) return id;
                if (id === 'deafDriver' && this.isDeafDriver(props.user)) return id;
                if (path && _.get(props.user, path)) return id;
                if (props.user[id]) return id;
                return false;
              })
              .value();
          }
          return field;
        })
        .value();
      this.setState({fields, user: props.user});
    }
  }

  isWomenOnly(user) {
    if (user.type === 'DRIVER') return user.grantedDriverTypes.indexOf('WOMEN_ONLY') > -1;
    return false;
  }

  isDeafDriver(user) {
    if (user.type === 'DRIVER') return user.specialFlags.indexOf('DEAF') > -1;
    return false;
  }

  handleFieldChange(field, newValue) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    fields[fieldIndex].value = newValue || '';
    this.setState({fields}, () => this.debounceSave());
  }

  renderField(field) {
    return (
      <FormField
        key={`activation-statuss-${field.id}`}
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

  renderActivationStatus() {
    if (!_.isEmpty(this.state.user)) {
      return (
        <ListGroup>
          <ListGroupItem className="clearfix">
            <strong><small>Activation Status</small></strong>
            <Row>
              {this.props.user.type === 'DRIVER' &&
                <Col sm={6}>
                  {this.renderSide('left')}
                </Col>
              }
              <Col sm={this.props.user.type === 'DRIVER' ? 6 : 12}>
                {this.renderSide('right')}
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      );
    }
    return <Loading loading height="185" />;
  }

  render() {
    return (
      <div className="user-activation-status">
        {this.renderActivationStatus()}
      </div>
    );
  }
}

export default ActivationStatus;

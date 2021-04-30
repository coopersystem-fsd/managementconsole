import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import {
  Modal,
  Button,
  ButtonToolbar,
  Row,
  Col,
  FormControl,
  ControlLabel,
  FormGroup,
  Checkbox,
  Alert,
  ListGroupItem,
  ListGroup,
} from 'react-bootstrap';
import { isEmpty } from 'validator';
import DatePicker from 'react-datetime';
import styles from './EditPromocodeModal.scss';
import { fromMultipleSelectValues, getTexasTime } from '../../helpers/common';

class EditPromocodeModal extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
  }

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      isNew: true,
      showModal: false,
      codeLiteral: '',
      cities: '',
      carTypes: '*',
      codeValue: '',
      driverId: '',
      maximumRedemption: null,
      maximumUsesPerAccount: null,
      startsOn: moment().startOf('day'),
      endsOn: moment().endOf('day'),
      useEndDate: moment().endOf('day'),
      newRidersOnly: false,
      nextTripOnly: false,
      applicableToFees: false,
      cappedAmountPerUse: null,
      errors: {},
      required: ['codeLiteral', 'codeValue', 'cities'],
      hasErrors: false,
    };
  }

  componentWillMount() {
    this.setData();
    this.onInit();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onInit() {
    const isNew = !_.isObject(this.props.promocode);
    let newState = {};
    let edit = {};

    if (!isNew) {
      edit = {
        title: this.props.promocode.title,
        codeLiteral: this.props.promocode.codeLiteral,
        codeValue: this.props.promocode.codeValue,
        driverId: this.props.promocode.driverId,
        maximumRedemption: this.props.promocode.maximumRedemption,
        maximumUsesPerAccount: this.props.promocode.maximumUsesPerAccount,
        cities: this.props.promocode.cities,
        carTypes: this.props.promocode.carTypes,
        startsOn: this.props.promocode.startsOn ?
          getTexasTime(moment(this.props.promocode.startsOn), false) : null,
        endsOn: this.props.promocode.endsOn ?
          getTexasTime(moment(this.props.promocode.endsOn), false) : null,
        useEndDate: this.props.promocode.useEndDate ?
          getTexasTime(moment(this.props.promocode.useEndDate), false) : null,
        newRidersOnly: this.props.promocode.newRidersOnly,
        nextTripOnly: this.props.promocode.nextTripOnly,
        applicableToFees: this.props.promocode.applicableToFees,
        cappedAmountPerUse: this.props.promocode.cappedAmountPerUse,
        promocodeObj: {
          id: this.props.promocode.id,
          promocodeType: this.props.promocode.promocodeType,
          uuid: this.props.promocode.uuid,
        },
      };
    } else {
      edit.carTypes = _.map(this.props.allCarTypes, ({carCategory}) => carCategory);
    }
    _.forEach(this.state.required, (v) => {
      const validate = {
        value: edit[v] || this.state[v],
        type: v,
        rule: isEmpty(_.toString(edit[v]) || this.state[v]),
      };
      const {errors} = this.handleValidation(validate);
      newState = Object.assign({}, newState, errors);
    });

    let hasErrors = false;
    _.forEach(newState, (v) => {
      if (v) hasErrors = true;
    });
    this.setState({
      errors: newState,
      hasErrors,
      isNew,
      ...edit,
      replicate: this.props.promocode.replicate,
    });
  }

  onSaveClick() {
    this.setState({errorMessage: null, loading: true});

    const {
      title,
      codeLiteral,
      codeValue,
      driverId,
      maximumRedemption,
      maximumUsesPerAccount,
      carTypes,
      cities,
      startsOn,
      endsOn,
      useEndDate,
      newRidersOnly,
      nextTripOnly,
      applicableToFees,
      cappedAmountPerUse,
    } = this.state;

    let promocode = {
      title,
      codeLiteral,
      codeValue,
      driverId,
      maximumRedemption,
      maximumUsesPerAccount,
      carTypes: fromMultipleSelectValues(carTypes, this.props.allCarTypes, 'carCategory'),
      cities: fromMultipleSelectValues(cities, this.props.allCities),
      startsOn,
      endsOn,
      useEndDate,
      newRidersOnly,
      nextTripOnly,
      applicableToFees,
      cappedAmountPerUse,
    };

    _.forEach(promocode, (v, k) => { if (v === '') promocode[k] = null; });

    if (promocode.startsOn) promocode.startsOn = getTexasTime(promocode.startsOn).toISOString();
    if (promocode.endsOn) promocode.endsOn = getTexasTime(promocode.endsOn).toISOString();
    if (promocode.useEndDate) {
      promocode.useEndDate = getTexasTime(promocode.useEndDate).toISOString();
    }

    const thenFn = ({payload}) => {
      if (!payload.error) this.props.onSuccess();
      this.setState({errorMessage: payload.errorMessage, loading: false});
    };

    if (this.state.isNew || this.state.replicate) {
      this.props.onCreatePromocode(promocode).then(thenFn);
    } else {
      promocode = Object.assign({}, this.state.promocodeObj, promocode);
      this.props.onEditPromocode(promocode).then(thenFn);
    }
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {show, body} = props;

    this.setState({
      showModal: show,
      body,
    });
  }

  isReadyToSubmit() {
    return false;
  }

  handleValidation({rule, type, value}) {
    const errors = Object.assign({}, this.state.errors, {[type]: rule});
    let hasErrors = false;
    _.forEach(errors, (v) => {
      if (v) hasErrors = true;
    });
    return {errors, hasErrors, [type]: value};
  }

  renderHeader() {
    return (
      <Modal.Header>
        <Modal.Title>
          {this.state.isNew && <span>Create New Promocode</span>}
          {this.state.replicate && <span>Replicate Promocode</span>}
          {!this.state.replicate && !this.state.isNew && <span>Edit Promocode</span>}
        </Modal.Title>
      </Modal.Header>
    );
  }

  renderBody() {
    const totalPromotionValuePerRider = this.state.codeValue * this.state.maximumRedemption;
    return (
      <Modal.Body>
        {this.state.errorMessage &&
          <Alert bsStyle="danger">
            {this.state.errorMessage}
          </Alert>
        }
        <FormGroup validationState={this.state.errors.title ? 'error' : null}>
          <ControlLabel>Code Title (max 50 char.)</ControlLabel>
          <FormControl
            type="text"
            placeholder="Enter Code Title"
            value={this.state.title}
            onChange={({target: {value}}) => {
              const rule = value.length > 50;
              const newState = this.handleValidation({rule, type: 'title', value});
              this.setState(newState);
            }}
          />
        </FormGroup>
        <FormGroup validationState={this.state.errors.codeLiteral ? 'error' : null}>
          <ControlLabel>Code Literal</ControlLabel>
          <FormControl
            type="text"
            placeholder="Enter Code Name"
            value={this.state.codeLiteral}
            onChange={({target: {value}}) => {
              const rule = isEmpty(value);
              const newState = this.handleValidation({rule, type: 'codeLiteral', value});
              this.setState(newState);
            }}
          />
        </FormGroup>
        <FormGroup validationState={this.state.errors.codeValue ? 'error' : null}>
          <ControlLabel>Total Promo Value (Limit) Per Account</ControlLabel>
          <FormControl
            type="number"
            placeholder="Enter Promo Value Per Account"
            value={this.state.codeValue}
            onChange={({target: {value}}) => {
              const rule = isEmpty(value);
              if (value < 0) {
                value = 0;
              }
              const newState = this.handleValidation({rule, type: 'codeValue', value});
              this.setState(newState);
            }}
          />
        </FormGroup>
        <FormGroup validationState={this.state.errors.maximumUsesPerAccount ? 'error' : null}>
          <ControlLabel>Maximum Uses Per Account</ControlLabel>
          <FormControl
            type="number"
            placeholder="Enter Amount"
            value={this.state.maximumUsesPerAccount}
            onChange={({target: {value: maximumUsesPerAccount}}) => {
              if (maximumUsesPerAccount < 0) {
                maximumUsesPerAccount = 0;
              }
              this.setState({maximumUsesPerAccount});
            }}
          />
        </FormGroup>
        <FormGroup validationState={this.state.errors.cappedAmountPerUse ? 'error' : null}>
          <ControlLabel>Capped amount per use</ControlLabel>
          <FormControl
            type="number"
            placeholder="Enter Amount"
            value={this.state.cappedAmountPerUse}
            onChange={({target: {value: cappedAmountPerUse}}) => {
              if (cappedAmountPerUse < 0) {
                cappedAmountPerUse = 0;
              }
              this.setState({cappedAmountPerUse});
            }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Maximum Redemption</ControlLabel>
          <FormControl
            type="number"
            placeholder="Enter Maximum Redemption"
            value={this.state.maximumRedemption}
            onChange={({target: {value: maximumRedemption}}) => {
              if (maximumRedemption < 0) {
                maximumRedemption = 0;
              }
              this.setState({maximumRedemption});
            }}
          />
        </FormGroup>
        <ListGroup>
          <ListGroupItem className="clearfix list-group-res">
            <span className="list-group-res-title"><strong><small>Restrictions</small></strong></span>
            <FormGroup className="top10">
              <ControlLabel>
                <strong>Total Cost of Promotion: {
                    _.isNaN(totalPromotionValuePerRider) ?
                      'Unlimited' :
                      totalPromotionValuePerRider === 0 ?
                        'Unlimited' :
                        `$${totalPromotionValuePerRider}`}
                </strong>
              </ControlLabel>
            </FormGroup>
            <Row>
              <Col sm={4}>
                <FormGroup validationState={this.state.errors.cities ? 'error' : null}>
                  <ControlLabel>Cities</ControlLabel>
                  {_.map(this.props.allCities, ({name, id}) =>
                    <Checkbox
                      key={_.uniqueId()}
                      checked={this.state.cities.indexOf(id) > -1}
                      onChange={() => {
                        const cities = _.xor(this.state.cities, [id]);
                        const rule = cities.length === 0;
                        const newState = this.handleValidation({rule, type: 'cities', value: cities});
                        this.setState(newState);
                      }}
                    >{name}</Checkbox>)}
                </FormGroup>
              </Col>
              <Col sm={4}>
                <FormGroup validationState={this.state.errors.carTypes ? 'error' : null}>
                  <ControlLabel>Car Categories</ControlLabel>
                  {_.map(this.props.allCarTypes, ({carCategory, title}) =>
                    <Checkbox
                      key={_.uniqueId()}
                      checked={this.state.carTypes.indexOf(carCategory) > -1}
                      onChange={() => {
                        const carTypes = _.xor(this.state.carTypes, [carCategory]);
                        if (carTypes.length === 0) return;
                        this.setState({carTypes});
                      }}
                    >{title}</Checkbox>)}
                </FormGroup>
              </Col>
              <Col sm={4}>
                <FormGroup>
                  <ControlLabel>{' '}</ControlLabel>
                  <Checkbox
                    checked={this.state.newRidersOnly}
                    onChange={() => this.setState({newRidersOnly: !this.state.newRidersOnly})}
                  >New Riders Only?
                  </Checkbox>
                  <Checkbox
                    name="nextTripOnly"
                    checked={this.state.nextTripOnly}
                    onChange={() =>
                      this.setState({
                        nextTripOnly: !this.state.nextTripOnly,
                        maximumUsesPerAccount: 1,
                      })}
                  >Next Trip Only?
                  </Checkbox>
                  <Checkbox
                    name="applicableToFees"
                    checked={this.state.applicableToFees}
                    onChange={() =>
                      this.setState({
                        applicableToFees: !this.state.applicableToFees,
                      })}
                  >Apply to fees?
                  </Checkbox>
                </FormGroup>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>


        <FormGroup>
          <ControlLabel>Driver ID</ControlLabel>
          <FormControl
            type="number"
            placeholder="Enter Driver ID"
            value={this.state.driverId}
            onChange={({target: {value: driverId}}) => this.setState({driverId})}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Start Date</ControlLabel>
          <DatePicker
            selected={this.state.startsOn}
            value={this.state.startsOn}
            closeOnSelect
            dateFormat="YYYY-MM-DD"
            onChange={startsOn => this.setState({startsOn})}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>End Date</ControlLabel>
          <DatePicker
            selected={this.state.endsOn}
            value={this.state.endsOn}
            closeOnSelect
            dateFormat="YYYY-MM-DD"
            onChange={endsOn => this.setState({endsOn})}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Use End Date</ControlLabel>
          <DatePicker
            className="topOpenDateClass"
            selected={this.state.useEndDate}
            value={this.state.useEndDate}
            closeOnSelect
            dateFormat="YYYY-MM-DD"
            onChange={useEndDate => this.setState({useEndDate})}
          />
        </FormGroup>
      </Modal.Body>
    );
  }

  render() {
    return (
      <Modal dialogClassName="editPromocodeModal" show={this.state.showModal} backdrop={'static'}>
        {this.renderHeader()}
        {this.renderBody()}
        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button onClick={this.props.onCancel}>Cancel</Button>
            <Button
              disabled={this.state.hasErrors || this.state.loading}
              onClick={() => this.onSaveClick()}
              bsStyle="primary"
            >{this.state.loading ? 'Saving...' : 'Save'}</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default cssModules(EditPromocodeModal, styles);

import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import {
  Modal,
  ButtonToolbar,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';
import styles from './AddPolygonModal.scss';

class AddPolygonModal extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      value: '',
    };
    this.onCancel = this.onCancel.bind(this);
    this.onSave = this.onSave.bind(this);
    this.getValidationState = this.getValidationState.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onCancel() {
    const {polygon} = this.state;
    if (polygon && polygon.setMap) polygon.setMap(null);
    this.setState({value: ''});
    this.props.onCancelNewPolygon();
  }

  onSave(e) {
    e.preventDefault();
    if (this.getValidationState() === 'error') return;
    const {polygon, value} = this.state;

    this.setState({value: '', showModal: false}, () => {
      polygon.name = value;
      this.props.onSaveNewPolygon(polygon);
    });
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {show, title, body, polygon = {name: null}, polygon: {name}} = props;
    if (!this.state.value) {
      this.setState({
        showModal: show,
        title,
        body,
        polygon,
        edit: !!name,
        value: name || '',
      });
    }
  }

  getValidationState() {
    const length = this.state.value.length;
    if (length > 0) return 'success';
    else if (length >= 0) return 'error';
    return false;
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <div className={styles.addPolygonModal}>
        <Modal show={this.state.showModal} backdrop={'static'}>
          <Modal.Header>
            <Modal.Title>{this.state.edit ? 'Edit Polygon' : 'Add new polygon'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.onSave}>
              <FormGroup
                controlId="formBasicText"
                validationState={this.getValidationState()}
              >
                <ControlLabel>Enter Polygon Name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.value}
                  placeholder="Enter name"
                  onChange={this.handleChange}
                />
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar className="pull-right">
              <Button bsStyle={'danger'} onClick={this.onCancel}>Cancel</Button>
              <Button bsStyle={'primary'} disabled={this.getValidationState() === 'error'} onClick={this.onSave}>Save Polygon</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default cssModules(AddPolygonModal, styles);

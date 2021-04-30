import React, { Component, PropTypes } from 'react';
import {
  Modal,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import Car from './Car';

class AddCarModal extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    carTypes: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      value: '',
    };
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
    this.props.onCancel();
  }

  onSave() {
    this.props.onSave(this.car.getCar());
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {show, carTypes} = props;
    this.setState({
      show,
      carTypes,
    });
  }

  isCarValid() {
    if (this.car) {
      return this.car.isFieldInvalid();
    }
    return true;
  }

  render() {
    return (
      <div className="add-car">
        <Modal show backdrop={'static'}>
          <Modal.Header>
            <Modal.Title>Add New Car</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Car
              ref={(ref) => { this.car = ref; }}
              carTypes={this.props.carTypes}
              onChange={() => {
                const car = Object.assign({}, this.state.car);
                this.setState({car});
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar className="pull-right">
              <Button
                bsStyle={'danger'}
                onClick={this.props.onCancel}
              >Cancel</Button>
              <Button
                disabled={this.isCarValid()}
                bsStyle={'primary'}
                onClick={() => this.onSave()}
              >Save Car</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default AddCarModal;

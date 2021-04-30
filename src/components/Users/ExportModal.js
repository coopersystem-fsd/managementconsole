import React, { Component, PropTypes } from 'react';
import {
  Modal,
  Label,
  Button,
} from 'react-bootstrap';

class ExportModal extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    selectedUserType: PropTypes.string,
    userEmail: PropTypes.string,
    show: PropTypes.bool,
    closeModal: PropTypes.func,
    sendUserData: PropTypes.func,
  }

  // Default Props Value
  static defaultProps = {
  };

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.closeModal}>
        <Modal.Header>
          <Modal.Title>Export {this.props.selectedUserType} Data</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          This will send {this.props.selectedUserType} data to
          <Label>{this.props.userEmail}</Label>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.closeModal}>Cancel</Button>
          <Button onClick={this.props.sendUserData} bsStyle="primary">Send</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportModal;

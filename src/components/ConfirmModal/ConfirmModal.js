import React, {Component} from 'react';
import {Modal, Button, Col, ButtonToolbar} from 'react-bootstrap';

export default class ConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
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
    const {show, title, body, yesText = 'Yes', noText = 'No'} = props;

    this.setState({
      showModal: show,
      title,
      body,
      yesText,
      noText,
    });
  }

  renderHeader(title) {
    if (title) {
      return (
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      );
    }
    return false;
  }

  renderBody(body) {
    if (body) {
      return (
        <Modal.Body>
          <Col>{body}</Col>
        </Modal.Body>
      );
    }
    return false;
  }

  render() {
    const {showModal, title, body, yesText, noText} = this.state;
    return (
      <Modal show={showModal} backdrop={'static'}>
        {this.renderHeader(title)}
        {this.renderBody(body)}
        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button onClick={this.props.onNoClick}>{noText}</Button>
            <Button bsStyle={'danger'} onClick={this.props.onYesClick}>{yesText}</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  }
}

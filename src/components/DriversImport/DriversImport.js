import React, { Component } from 'react';
import _ from 'lodash';
import {
  Alert,
  ControlLabel,
  FormControl,
  FormGroup,
  Col,
  Button,
  Modal,
} from 'react-bootstrap';

const CONSTANTS = {
  notes: [
    'First line of import file is omitted while processing and is used only for human readability.',
    'Boolean fields support both 1/0 and true/false notations.',
    'If field value is not specified in CSV file, it won\'t be updated.',
  ],
};

export default class UploadDriversDataModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarType: null,
      showUploadCSVModal: this.props.openModal,
      csvFile: null,
    };

    this.onCloseCSVUploadModal = this.onCloseCSVUploadModal.bind(this);
    this.onUploadCSVFile = this.onUploadCSVFile.bind(this);
    this.renderNotification = this.renderNotification.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.openModal) {
      this.onOpenCSVUploadModal();
    }
  }

  onOpenCSVUploadModal() {
    this.setState({ showUploadCSVModal: true });
  }

  onCloseCSVUploadModal() {
    this.props.onClose();
    this.props.actions.loading({error: null, status: null});
    this.setState({ showUploadCSVModal: false, csvFile: null, csvFileError: null });
  }

  onUploadCSVFile() {
    const { csvFile } = this.state;
    this.setState({error: false});
    this.props.actions.upload(csvFile)
      .then(({error}) => {
        if (error) {
          this.setState({error});
        }
      });
  }

  renderNotification({ status, error } = this.props.driversImport) {
    if (!status) return false;
    function renderMessage(errors) {
      if (!errors) return 'Unknown error';

      if (_.isArray(errors)) {
        return (
          <ul>
            {_.map(errors, ({value, rowNumber, message, field}) =>
              <li className="bottom10" style={{wordBreak: 'break-word'}}>
                <div><strong>Row:</strong> {rowNumber}</div>
                <div><strong>Field:</strong> {field}</div>
                <div><strong>Value:</strong> {value}</div>
                <div><strong>Message:</strong> {message}</div>
              </li>
            )}
          </ul>
        );
      }

      return errors;
    }
    const notifications = [
      { status: 'success', message: 'File was successfully processed', className: 'success' },
      { status: 'uploading', message: 'File is uploading, please wait...', className: 'info' },
      { status: 'error', message: renderMessage(error), className: 'danger' },
    ];
    const statusExists = _.find(notifications, { status });
    if (statusExists) {
      const { message, className } = statusExists;
      return (
        <Col xs={12}>
          <Alert bsStyle={className}>
            {message}
          </Alert>
        </Col>
      );
    }
    return false;
  }

  render() {
    return (
      <Modal show={this.state.showUploadCSVModal} onHide={this.onCloseCSVUploadModal} backdrop={'static'}>
        <Modal.Header>
          <Modal.Title>
            Upload CSV - Update Drivers Data
            <Button bsSize="small" className="pull-right" onClick={() => this.props.actions.getSample()}>Get Sample</Button>
          </Modal.Title>

        </Modal.Header>
        <Modal.Body className="clearfix">
          {this.renderNotification()}

          <Col xs={12}>
            <strong>NOTES:</strong>
            <ul>
              {CONSTANTS.notes.map(note => <li>{note}</li>)}
            </ul>
            <hr />
          </Col>
          <FormGroup validationState={this.state.csvFileError && 'error'}>
            <Col xs={3}>
              <ControlLabel>
                {!this.state.csvFileError && <span>Select .csv file</span>}
                {this.state.csvFileError}
              </ControlLabel>
            </Col>
            <Col xs={9}>
              <FormControl
                type="file"
                accept=".csv"
                className="form-control"
                onChange={(e) => {
                  e.preventDefault();
                  const files = [...e.target.files];
                  this.setState({
                    csvFile: files[0],
                  });
                }}
              />
            </Col>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle={'danger'} onClick={this.onCloseCSVUploadModal}>Close</Button>
          <Button
            bsStyle={'primary'}
            onClick={this.onUploadCSVFile}
            disabled={_.isNull(this.state.csvFile) || this.props.driversImport.loading}
          >Upload</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

import React from 'react';
import { Modal, Button, Label } from 'react-bootstrap';

export default ({show, filters, user, sendingExport, onSend, onCancel}) =>
  <Modal backdrop={'static'} show={!!show}>
    <Modal.Header>
      <Modal.Title>Send Drivers Export</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Export will be sent to email: <Label>{user.email}</Label>
      {filters.length > 0 &&
        <div>Applied filters:</div>
      }
      <ul>
        {_.map(filters, filter => <li><strong>{filter.name}:</strong> {filter.values}</li>)}
      </ul>
    </Modal.Body>
    <Modal.Footer>
      <Button
        disabled={sendingExport}
        onClick={() => onCancel()}
      >Cancel</Button>
      <Button
        disabled={sendingExport}
        onClick={() => onSend()}
        bsStyle="primary"
      >{sendingExport ? 'Sending...' : 'Send Export'}</Button>
    </Modal.Footer>
  </Modal>;

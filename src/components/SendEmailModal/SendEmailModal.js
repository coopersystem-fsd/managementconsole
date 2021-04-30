import React, { Component, PropTypes } from 'react';
import cssModules from 'react-css-modules';
import {
  Button,
  FormGroup,
  Modal,
  ControlLabel,
  Col,
  Form,
} from 'react-bootstrap';
import { isEmpty } from 'validator';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import { convertToRaw } from 'draft-js';
import styles from './SendEmailModal.scss';
import FormField from '../common/FormField';


class SendEmailModal extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    from: PropTypes.string,
    to: PropTypes.string,
    subject: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    body: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    onCancelClick: PropTypes.func.isRequired,
    onSendClick: PropTypes.func,
    show: PropTypes.bool.isRequired,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
    from: '',
    to: '',
    subject: '',
    body: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      hasErrors: false,
    };
  }

  componentDidMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onChangeField(value) {
    this.setState(value);
  }

  onSend() {
    this.setState({sendingEmail: true});
    const values = {};
    _.forEach(this.state.fields, (field) => { values[field.id] = field.value; });

    this.props.onSendClick(values)
      .then(() => this.setState({sendingEmail: false}))
      .then(this.props.onCancelClick);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    if (!this.state.fields) {
      const fields =
      _.chain(props.fields)
        .map((field) => {
          field.value = props[field.id] || '';
          if (field.value === true) field.value = '';
          field.rules = field.required ? isEmpty : () => null;
          return field;
        })
        .value();
      this.setState({fields});
    }
  }

  isReadyToSubmit() {
    return false;
  }

  handleFormValidation() {
    let hasErrors = false;
    _.forEach(this.state.fields, (field) => {
      const value = field.value ? field.value.toString() : '';
      const fieldHasError = field.rules(value);
      if (fieldHasError) hasErrors = true;
    });
    return hasErrors;
  }

  handleFieldChange(field, newValue) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    fields[fieldIndex].value = newValue || '';
    this.setState({fields});
  }

  renderFields() {
    if (this.state.fields) {
      return (
        <Form className="clearfix">
          {
            _.chain(this.state.fields)
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

  renderField(field) {
    const value = field.value ? field.value.toString() : '';
    const hasErrors = field.rules(value) ? 'error' : null;
    if (field.type === 'textarea') {
      return (
        <Col sm={12}>
          <Editor
            editorState={this.state.editorState}
            toolbarClassName="home-toolbar"
            wrapperClassName="home-wrapper"
            editorClassName="home-editor editor"
            onEditorStateChange={(editorState) => {
              const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
              this.handleFieldChange(field, html);
              this.setState({editorState});
            }}
          />
        </Col>
      );
    }
    return (
      <FormField
        key={`email-${field.id}`}
        hasErrors={hasErrors}
        field={field}
        order={field.order}
        onChange={newValue => this.handleFieldChange(field, newValue)}
      />
    );
  }

  renderEmailModal() {
    if (this.props.show) {
      return (
        <Modal backdrop={'static'} show={this.props.show} dialogClassName={`sendEmailModal ${this.props.className ? this.props.className : ''}`}>
          {!this.props.hideHeader &&
            <Modal.Header>
              <Modal.Title>{this.props.title ? `Send Email: ${this.props.title}` : 'Send Email'}</Modal.Title>
            </Modal.Header>
          }
          <Modal.Body className="clearfix">
            {this.renderFields()}
            {this.props.preview &&
              <Col sm={12}>
                <FormGroup>
                  <ControlLabel>Preview</ControlLabel>
                  <iframe
                    className="preview"
                    frameBorder="0"
                    src={`data:text/html;charset=utf-8,${encodeURI(this.props.preview)}`}
                  />
                </FormGroup>
              </Col>
            }
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => this.props.onCancelClick()}
              disabled={this.state.sendingEmail}
            >{this.props.cancelText || 'Cancel'}</Button>
            {this.props.onSendClick &&
              <Button
                disabled={this.handleFormValidation() || this.state.sendingEmail}
                onClick={() => this.onSend()}
                bsStyle="primary"
              >{this.state.sendingEmail ? 'Sending...' : 'Send Email'}</Button>
            }
          </Modal.Footer>
        </Modal>
      );
    }
    return false;
  }

  render() {
    return (
      <div className={styles.sendEmailModal}>
        {this.renderEmailModal()}
      </div>
    );
  }
}

export default cssModules(SendEmailModal, styles);

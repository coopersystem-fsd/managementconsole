import React, { Component, PropTypes } from 'react';
import {
  Button,
  ButtonToolbar,
  ListGroupItem,
  ListGroup,
} from 'react-bootstrap';
import 'react-select/dist/react-select.css';
import Select from 'react-select';
import {SendEmailModal} from '../';

require('react-datepicker/dist/react-datepicker.css');

class EmailFollowUp extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    user: PropTypes.object.isRequired,
    emailReminders: PropTypes.array.isRequired,
    enableEnter: PropTypes.bool,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      keystring: '',
      draftModal: null,
    };
    this.handleKeyDownEvent = (e) => {
      if (this.state.sendingEmail || this.state.draftModal) return;
      const enterKeyPressed = e.keyCode === 13;
      const char = String.fromCharCode(e.keyCode).toLowerCase();
      const emailReminder = Object.assign({}, this.state.emailReminder);
      const currentFocues = document.activeElement;
      const isInput = currentFocues.className === 'form-control';

      if (enterKeyPressed && !isInput) {
        document.getElementById('draft-button').focus();
      } else if (/[a-z]/.test(char)) {
        const state = {};
        state.keystring = this.state.keystring + char;

        const partialMatch = _.find(emailReminder.allValues, (v) => {
          if (v.label.toLowerCase().indexOf(state.keystring) > -1) return true;
          return false;
        });

        if (partialMatch && !isInput) {
          this.select.focus();
        }

        this.typeDebounce();
      }
    };
  }

  componentWillMount() {
    this.setData();
    this.typeDebounce = _.debounce(this.clearKeypressString, 500);
    document.addEventListener('keydown', this.handleKeyDownEvent);
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDownEvent);
  }

  onSendEmail(emailFields = {}) {
    const email = {
      driverId: this.state.user.id,
      reminderId: this.state.selectedReminder,
      ...emailFields,
    };

    this.setState({sendingEmail: true});
    return this.props.onSend(email)
      .then(() => this.setState({sendingEmail: false}));
  }

  getEmailTemplate() {
    this.setState({loadingEmailTemplate: true});
    const emailReminder =
      _.find(this.props.emailReminders.slice(),
        {id: _.toNumber(this.state.emailReminder.value.value)});

    emailReminder.extraFields = _.map(emailReminder.extraFields, (f) => {
      const field = Object.assign({}, f);
      field.type = f.type.toLowerCase();
      field.required = true;
      return field;
    });

    const draftModal = {fields: emailReminder.extraFields};

    if (emailReminder.name === 'Custom') {
      draftModal.preview = null;
      draftModal.subject = true;
      draftModal.title = emailReminder.label;
      draftModal.body = `Dear ${this.state.user.firstname} ${this.state.user.lastname}, \n \n \n Sincerely, ${this.props.city.appName} Onboarding Team`;
      this.setState({
        draftModal,
        loadingEmailTemplate: false,
      });
      return false;
    }

    this.props.getEmailTemplate({
      reminderId: this.state.emailReminder.value.value,
      driverId: this.state.user.id,
    })
    .then(({payload: preview}) => {
      draftModal.preview = preview;
      this.setState({
        draftModal,
        loadingEmailTemplate: false,
      });
    });
    return false;
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user, emailReminders} = props;
    const state = {user};

    const allValues =
      _.chain(emailReminders)
      .map(({id: value, name: label}) =>
        ({value: String(value), label}))
      .value();

    state.emailReminder = {
      id: 'emailReminder',
      allValues,
      value: null,
      name: '',
      type: 'select',
    };

    this.setState(state);
  }

  isCustom() {
    const selectedReminder =
      _.find(this.props.emailReminders.slice(),
        {id: _.toNumber(this.state.emailReminder.value.value)});
    return selectedReminder.extraFields.length > 0;
  }

  clearKeypressString() {
    this.setState({keystring: ''});
  }

  handleFieldChange(value) {
    const emailReminder = Object.assign({}, this.state.emailReminder, {value});
    const selectedReminder = value ? value.value : null;
    this.setState({emailReminder, selectedReminder});
  }

  renderEmailFollowUp() {
    const field = this.state.emailReminder;
    field.disabled = this.state.sendingEmail;
    return (
      <div className="top15">
        <Select
          ref={(ref) => { this.select = ref; }}
          id="email-select"
          name="select-email-followup"
          autosize={false}
          value={field.value}
          placeholder="Select Email..."
          options={field.allValues}
          onChange={newValue => this.handleFieldChange(newValue)}
        />
      </div>
    );
  }

  renderActions() {
    if (this.state.emailReminder) {
      const isDisabled =
        this.state.sendingEmail ||
        !this.state.emailReminder.value ||
        this.state.loadingEmailTemplate;
      return (
        <ButtonToolbar className="top28">
          <Button
            id="draft-button"
            disabled={isDisabled}
            onClick={() => this.getEmailTemplate()}
          >Draft</Button>
          <Button
            ref={(ref) => { this.sendButton = ref; }}
            disabled={isDisabled || this.isCustom()}
            onClick={email => this.onSendEmail(email)}
          >{this.state.sendingEmail ? 'Sending...' : 'Send'}</Button>
        </ButtonToolbar>
      );
    }
    return false;
  }

  renderDraftModal() {
    if (this.state.draftModal) {
      return (
        <SendEmailModal
          className="email-reminder-modal large"
          {...this.state.draftModal}
          onCancelClick={() => { this.setState({draftModal: null}); }}
          onSendClick={email => this.onSendEmail(email)}
          show={!!this.state.draftModal}
        />
      );
    }
    return false;
  }

  renderLastComm() {
    const lastCom = _.chain(this.props.emailHistory).last().value();
    return (
      <div className="">
        <div>Last Communication:</div>
        <div className="text-muted">{lastCom ? `${lastCom.communicationType}` : 'n/a'}</div>
        <div className="text-muted">{lastCom ? `${moment(lastCom.date, 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')}` : ''}</div>
      </div>
    );
  }

  render() {
    return (
      <div className="email-follow-up">
        <ListGroup>
          <ListGroupItem className="clearfix">
            <strong><small>Email Follow Up</small></strong>
            {this.renderLastComm()}
            {this.renderEmailFollowUp()}
            {this.renderActions()}
          </ListGroupItem>
        </ListGroup>
        {this.renderDraftModal()}
      </div>
    );
  }
}

export default EmailFollowUp;

import React, { Component, PropTypes } from 'react';
import {
  Button,
  Label,
  Col,
  Row,
  Modal,
  Table,
  Alert,
} from 'react-bootstrap';
// import {PaginatedTable} from '../';
import FormField from '../common/FormField';
import constants from '../../data/constants';

class Checkr extends Component { // eslint-disable-line react/prefer-stateless-function
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
    this.state = {
      sortable: [
        { name: 'Checkr ID', property: 'id', sort: false },
        { name: 'License Class', property: 'licenseClass', sort: false },
        { name: 'License Issued Date', property: 'licenseIssuedDate', sort: false },
        { name: 'License Status', property: 'licenseStatus', sort: false },
        { name: 'Accidents Count', property: 'accidentsCount', sort: false },
        { name: 'Restrictions Count', property: 'restrictionsCount', sort: false },
        { name: 'Violations Count', property: 'violationsCount', sort: false },
        { name: 'Created At', property: 'createdDate', sort: false },
        { name: 'Status', property: 'status', sort: false },
      ],
    };
  }

  componentWillMount() {
    this.debounceCheckrNotes = _.debounce(this.onUpdateCheckrNotes, 1000);
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onCheckrRequest() {
    this.setState({ requestCheckrLoading: true });
    this.props.onCheckrRequest({id: this.state.user.id})
      .then((payload) => {
        const state = {requestCheckrLoading: false, error: payload.error};
        if (!payload.error) state.showRequestCheckrModal = false;
        this.setState(state);
      });
  }

  onUpdateCheckrNotes(checkrStatusNotes) {
    this.setState({updateCheckrNotesLoading: true});
    const newUser = Object.assign({}, this.state.user, checkrStatusNotes);
    if (this.props.onCheckrNotesChange) {
      this.props.onCheckrNotesChange(newUser)
        .then(() => this.setState({updateCheckrNotesLoading: false}));
    }
  }

  onUpdateCheckrReport() {
    this.setState({updateCheckrReportLoading: true, loading: true, data: null}, () => {
      if (this.props.updateCheckrReport) {
        this.props.updateCheckrReport(this.state.user.id)
        .then(() => {
          this.setState({
            updateCheckrReportLoading: false,
            loading: false,
            fields: null,
          });
        });
      }
    });
  }

  onUpdateRows() {
    this.props.onChange();
  }

  setTable(user) {
    return _.map(user.checkrReports, (row, i) => {
      const dateFormat = 'YYYY-MM-DD HH:mm';
      const mappedRow = {};
      _.forEach(this.state.sortable, ({property}) => { mappedRow[property] = row[property]; });

      mappedRow.licenseIssuedDate =
        mappedRow.licenseIssuedDate ? moment(row.licenseIssuedDate).format(dateFormat) : null;
      mappedRow.createdDate =
        mappedRow.createdDate ? moment(row.createdDate).format(dateFormat) : null;
      mappedRow.status = this.renderCheckrStatus(i, row.status);

      return mappedRow;
    });
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user} = props;
    const state = {user};
    if (!this.state.fields) {
      state.fields = this.mapFields(user);
    }

    this.setState(state);
  }

  mapFields(user) {
    return _.map(constants.user.background, (field) => {
      if (field.id === 'checkrStatus') {
        const allValues = _.find(constants.driverFunnel.filters, {id: 'checkrStatus'});
        field.allValues = allValues.options.slice(1);
      }
      field.value = user[field.id] || '';
      return field;
    });
  }

  handleFieldChange(field, newValue) {
    const fields = this.state.fields.slice();
    const fieldIndex = _.findIndex(fields, {id: field.id});
    fields[fieldIndex].value = newValue || '';
    if (field.id === 'checkrStatusNotes') {
      this.debounceCheckrNotes({checkrStatusNotes: newValue});
    } else if (field.id === 'checkrStatus') {
      this.onUpdateCheckrNotes({checkrStatus: newValue});
    }
    this.setState({fields});
  }

  renderField(field, size = 3) {
    return (
      <Col sm={size} key={`checkr-${field.id}`}>
        <Row>
          <FormField
            field={field}
            order={field.order}
            onChange={newValue => this.handleFieldChange(field, newValue)}
          />
        </Row>
      </Col>
    );
  }

  renderFields(isModal, size) {
    return _.chain(this.state.fields)
    .filter((f) => {
      if (isModal) {
        return f.modal;
      } else if (!f.modal) {
        return true;
      }
      return false;
    })
    .map(field => this.renderField(field, size))
    .value();
  }

  renderCheckrStatus(key, status) {
    const bsStyle = status === 'CLEAR' ? 'success' : status === 'CONSIDER' ? 'danger' : 'warning';
    const label = (<div><h4><Label bsStyle={bsStyle}> {status} </Label></h4></div>);
    if (status === 'PENDING' && key === 0) {
      return (
        <Button
          bsSize="small"
          bsStyle={bsStyle}
          onClick={() => this.onUpdateCheckrReport()}
          disabled={this.state.updateCheckrReportLoading}
        >{status} <i className={`fa fa-refresh ${this.state.updateCheckrReportLoading ? 'fa-spin fa-fw' : ''}`} /></Button>
      );
    }
    return label;
  }

  renderTable() {
    return (
      <div className="table-responsive responsive-mobile">
        <Table striped bordered condensed hover>
          <thead><tr>{_.map(this.state.sortable, f =>
            <th key={_.uniqueId()}>{f.name}</th>)}</tr></thead>
          <tbody>{_.map(this.setTable(this.state.user), row =>
            <tr key={_.uniqueId()}>{_.map(row, v =>
              <td key={_.uniqueId()}>{v}</td>)}</tr>)}</tbody>
        </Table>
      </div>
    );
  }

  renderRequestNewReportButton() {
    return (
      <Col sm={3} className="top25 pull-right">
        <Button
          className="pull-right"
          bsStyle="primary"
          onClick={() => this.setState({showRequestCheckrModal: true})}
        >Request New Report</Button>
      </Col>
    );
  }

  renderRequestCheckrModal() {
    if (this.state.showRequestCheckrModal) {
      return (
        <Modal show={this.state.showRequestCheckrModal} backdrop={'static'} >
          <Modal.Header>
            <Modal.Title>Request Checkr Report</Modal.Title>
          </Modal.Header>

          {this.state.error && <Modal.Body className="clearfix">
            <Alert bsStyle="danger">{this.state.error}</Alert>
          </Modal.Body>}

          <Modal.Footer>
            <Button
              disabled={this.state.requestCheckrLoading}
              onClick={() => this.setState({showRequestCheckrModal: false})}
            >Cancel</Button>
            <Button
              disabled={this.state.requestCheckrLoading}
              bsStyle="primary"
              onClick={() => this.onCheckrRequest()}
            >{this.state.requestCheckrLoading ? 'Requesting...' : 'Request'}</Button>
          </Modal.Footer>

        </Modal>
      );
    }
    return false;
  }

  render() {
    return (
      <div className="checkr">
        <Row className="bottom15">
          {this.renderFields()}
          {this.renderRequestNewReportButton()}
        </Row>
        {this.renderTable()}
        {this.renderRequestCheckrModal()}
      </div>
    );
  }
}

export default Checkr;

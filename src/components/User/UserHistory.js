import React, { Component, PropTypes } from 'react';
import {
  ListGroupItem,
  ListGroup,
  Table,
  Row,
  Col,
} from 'react-bootstrap';
import {SendEmailModal} from '../';
import FormField from '../common/FormField';
import UserHistoryContainer from '../../containers/UserHistoryContainer';

require('react-datepicker/dist/react-datepicker.css');

class UserHistory extends Component { // eslint-disable-line react/prefer-stateless-function
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
      emailHistory: [],
      queryType: 'actor',
    };
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onClick(params) {
    this.props.getEmail(params)
      .then(({payload: preview}) => {
        if (!preview.error) {
          const draftModal = {};
          draftModal.preview = preview;
          this.setState({
            draftModal,
            loadingEmailTemplate: false,
          });
        }
      });
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user, emailHistory = []} = props;
    let mappedEmailHistory = [];

    if (emailHistory.length > 0) {
      mappedEmailHistory =
      _.chain(emailHistory)
        .map((email) => {
          const i = Object.assign({}, email);
          i.type = 'email';
          return i;
        })
        .value();
    }
    const state = {user, emailHistory: mappedEmailHistory};
    this.setState(state);
  }

  loadUserHistory() {
    if (this.userHistory) {
      this.userHistory.mergedProps.actions.getUserHistory(this.props.user.id);
    }
  }

  renderDraftModal() {
    if (this.state.draftModal) {
      return (
        <SendEmailModal
          className="email-reminder-modal large"
          {...this.state.draftModal}
          onCancelClick={() => { this.setState({draftModal: null}); }}
          hideHeader
          cancelText="Close"
          show={!!this.state.draftModal}
        />
      );
    }
    return false;
  }


  render() {
    return (
      <div className="user-history">
        <ListGroup>
          <ListGroupItem className="clearfix">
            <strong><small>Email Log</small></strong>
            <Row>
              <Row>
                <Col sm={4} className="rightp0">
                  <FormField
                    field={{
                      type: 'text',
                      value: this.state.query,
                      name: '',
                      placeholder: 'Search...',
                      className: 'bottom0 top10',
                    }}
                    onChange={query => this.setState({query})}
                  />
                </Col>
                <Col sm={2} className="leftp0">
                  <FormField
                    field={{
                      type: 'select',
                      name: '',
                      value: this.state.queryType,
                      allValues: [
                        {id: 'communicationType', name: 'Type'},
                        {id: 'actor', name: 'Name'},
                      ],
                      placeholder: 'Search Type',
                      className: 'bottom0 top10',
                    }}
                    onChange={queryType => this.setState({queryType})}
                  />
                </Col>
              </Row>
            </Row>
            {this.state.emailHistory.length > 0 &&
              <div className="table-responsive responsive-mobile top15">
                <Table striped bordered condensed hover>
                  <tbody>
                    {_.chain(this.state.emailHistory)
                        .filter((record) => {
                          if (this.state.query) {
                            const value = record[this.state.queryType];
                            const recordValue =
                              _.chain([value])
                                .map(_.toString)
                                .map(_.toLower)
                                .first()
                                .value();

                            return recordValue.indexOf(this.state.query.toLowerCase()) > -1;
                          }
                          return record;
                        })
                        .map(({
                          id,
                          date,
                          actor,
                          communicationType,
                        }) =>
                          <tr key={_.uniqueId()} onDoubleClick={() => this.onClick(id)} style={{cursor: 'pointer'}}>
                            <td key={_.uniqueId()}>{date}</td>
                            <td key={_.uniqueId()}>{actor}</td>
                            <td key={_.uniqueId()}>{communicationType}</td>
                          </tr>
                        )
                      .value()
                    }
                  </tbody>
                </Table>
              </div>
            }
            {this.state.emailHistory.length === 0 && <div>No previous email communication</div>}
          </ListGroupItem>
        </ListGroup>
        <ListGroup>
          <ListGroupItem className="clearfix">
            <strong><small>Change log</small></strong>
            <UserHistoryContainer
              driverId={this.props.user.id}
              ref={(ref) => { this.userHistory = ref; }}
            />
          </ListGroupItem>
        </ListGroup>
        {this.renderDraftModal()}
      </div>
    );
  }
}

export default UserHistory;

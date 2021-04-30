import React, {Component, PropTypes} from 'react';
import {
  ListGroupItem,
  ListGroup,
  Col,
  Row,
} from 'react-bootstrap';
import FormField from '../common/FormField';
import {getTexasTime} from '../../helpers/common';
import Loading from '../Loading';

export default class UserHistory extends Component {
  static propTypes = {
    driverId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  constructor(props) {
    super(props);
    this.state = {
      date: moment.utc(),
    };
  }

  componentDidMount() {
    this.loadHistory();
  }

  componentWillUnmount() {
    this.props.actions.clear();
  }

  loadHistory() {
    this.props.actions.getUserHistory(
      this.props.driverId,
      this.state.date.format('YYYY-MM-DD'),
    );
  }

  render() {
    return (
      <div>
        {this.props.userHistory.Loading &&
          <Loading height={200} loading={this.props.userHistory.Loading} />}
        {!this.props.userHistory.Loading &&
          <div>
            <Row>
              <Col sm={2} className="leftp0">
                <FormField
                  field={{
                    type: 'date',
                    value: this.state.date,
                    name: '',
                    dateFormat: 'YYYY-MM-DD',
                    className: 'bottom15 top10',
                    props: {maxDate: moment()},
                  }}
                  onChange={date => this.setState({date}, this.loadHistory())}
                />
              </Col>
            </Row>
            {_.isEmpty(this.props.userHistory.data) &&
              <span>No user changes for selected date</span>}
            <ListGroup>
              {_.map(this.props.userHistory.data, ({
                changedFieldName,
                entityId,
                entityName,
                newValue,
                previousValue,
                revisionDate,
              }) =>
                <ListGroupItem className="clearfix" key={_.uniqueId()} href="">
                  [{getTexasTime(moment(revisionDate), false).format('YYYY-MM-DD HH:mm a')}] ({entityId}) {entityName} | {changedFieldName}: {previousValue} {'->'} {newValue}
                </ListGroupItem>
              )}
            </ListGroup>
          </div>
        }
      </div>
    );
  }
}

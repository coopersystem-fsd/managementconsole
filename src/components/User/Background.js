import React, { Component, PropTypes } from 'react';
import {
  Col,
  ListGroupItem,
  ListGroup,
} from 'react-bootstrap';
import TNCViewContainer from '../../containers/TNCViewContainer';
import Checkr from './Checkr';

require('react-datepicker/dist/react-datepicker.css');

class Background extends Component { // eslint-disable-line react/prefer-stateless-function
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
    const {user} = props;
    const state = {user};

    this.setState(state);
  }

  renderTNCCard() {
    return (
      <ListGroup>
        <ListGroupItem className="clearfix">
          <strong><small>TNC Card</small></strong>
          <TNCViewContainer
            userId={String(this.props.user.id)}
            key="tncView"
            sm={4}
            singleDocument
            onChange={() => this.props.onChange()}
          />
        </ListGroupItem>
      </ListGroup>
    );
  }

  renderCheckr() {
    return (
      <ListGroup>
        <ListGroupItem className="clearfix">
          <strong><small>Checkr Reports</small></strong>
          <Checkr
            updateCheckrReport={this.props.updateCheckrReport}
            user={this.props.user}
            onCheckrNotesChange={this.props.onCheckrNotesChange}
            onCheckrRequest={this.props.onCheckrRequest}
            onChange={() => this.setState({checkrChanged: true})}
          />
        </ListGroupItem>
      </ListGroup>
    );
  }

  render() {
    return (
      <div className="background">
        <Col sm={12}>
          {this.renderTNCCard()}
        </Col>
        <Col sm={12}>
          {this.renderCheckr()}
        </Col>
      </div>
    );
  }
}

export default Background;

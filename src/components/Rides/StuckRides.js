import React, { Component, PropTypes } from 'react';
import {
  Modal,
  Button,
  Alert,
  Row,
} from 'react-bootstrap';
import { Table, Tr, Td } from '../../lib/reactable';
import constants from '../../data/constants';
import { getTexasTime } from '../../helpers/common';

const driverStatusMap = {};
constants.common.driverStatus.forEach((status) => { driverStatusMap[status.id] = status.name; });

class StuckRides extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    loadingStuckRides: PropTypes.bool,
    show: PropTypes.bool,
    autoHide: PropTypes.bool, // eslint-disable-line
    onClose: PropTypes.func,
  }

  // Default Props Value
  static defaultProps = {
    loadingStuckRides: false,
    autoHide: true,
    show: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,
    };

    this.onClose = this.onClose.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if ('show' in newProps) {
      this.setState({
        show: newProps.show,
      });
    }
  }

  onClose() {
    if (this.state.autoHide && this.state.show) {
      this.setState({show: false});
    }
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  renderStuckRides() {
    if (this.props.loadingStuckRides) {
      return (<Alert bsStyle="info">
        <h4>Please wait while data is being loaded.</h4>
      </Alert>);
    }
    const stuckRides = this.props.stuckRides || [];
    if (!stuckRides) {
      return null;
    }
    if (stuckRides.length === 0) {
      return <Row>No stuck rides available.</Row>;
    }
    const timeFormat = 'MMMM Do YYYY, h:mm a';

    return (
      <div className="table-responsive responsive-mobile">
        <Table className="table table-striped table-bordered table-condensed table-hover">
          {
            stuckRides.map((stockRide) => {
              const date = getTexasTime(
                moment.utc(stockRide.locationUpdatedOn), false).format(timeFormat);
              return (
                <Tr>
                  <Td key="activeDriverId" column="Ride ID">
                    {stockRide.id}
                  </Td>
                  <Td key="activeDriverStatus" column="Driver Status">{stockRide.activeDriverStatus}</Td>
                  <Td key="locationUpdatedOn" column="Location Updated">{date}</Td>
                  <Td key="status" column="Status">{driverStatusMap[stockRide.status]}</Td>
                </Tr>
              );
            })
          }
        </Table>
      </div>
    );
  }

  render() {
    return (
      <Modal show={this.state.show} onHide={this.onClose}>
        <Modal.Header>
          <Modal.Title>Stuck Rides</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.renderStuckRides()}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default StuckRides;

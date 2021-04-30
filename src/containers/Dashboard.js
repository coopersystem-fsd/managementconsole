import React, {Component} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {Col, Button, Row, Grid} from 'react-bootstrap';
import { Notifications, MenuItems } from '../components';
import constants from '../data/constants';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.handleBack = this.handleBack.bind(this);
    this.renderBackButton = this.renderBackButton.bind(this);
  }

  handleBack() {
    this.props.router.goBack();
  }

  renderBackButton() {
    if (this.props.params.userID || this.props.params.rideID) {
      return (
        <Button onClick={this.handleBack}>Back</Button>
      );
    }
    return false;
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col sm={2} xsHidden md={2} lg={2} className="menuCol">
            {this.renderBackButton()}
            <MenuItems
              menuItems={constants.menuItems}
              location={this.props.location}
              router={this.props.router}
              user={this.props.user}
              navStyle={'pills'}
            />
          </Col>
          <Col xs={12} sm={10} md={10} lg={10}>
            <Notifications />
            {this.props.children}
          </Col>
        </Row>
      </Grid>
    );
  }
}

const mapStateToProps = state => (
  {
    user: state.login.user,
  }
);
export default connect(mapStateToProps)(withRouter(Dashboard));

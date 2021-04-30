import React, {Component} from 'react';
import {Nav, NavItem} from 'react-bootstrap';
import { hasRole } from '../../helpers/auth';

export default class MenuItems extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.renderMenuItems = this.renderMenuItems.bind(this);
  }

  handleSelect(eventKey) {
    if (this.props.location.pathname !== eventKey) {
      this.props.router.replace(eventKey);
      if (this.props.onItemClick) this.props.onItemClick();
    }
  }

  renderMenuItems(menuItems) {
    if (menuItems) {
      return _.map(menuItems, ({name, rolesRequired, path}) => {
        const {user} = this.props;
        const showItem = hasRole({user, rolesRequired}) ? '' : 'hidden';
        return (
          <NavItem
            key={path}
            className={showItem}
            eventKey={path}
          >{name}
          </NavItem>
        );
      });
    }
    return false;
  }

  render() {
    return (
      <Nav
        className={this.props.className}
        bsStyle={this.props.navStyle}
        stacked
        activeKey={this.props.location.pathname}
        onSelect={this.handleSelect}
      >
        {this.renderMenuItems(this.props.menuItems)}
      </Nav>
    );
  }
}

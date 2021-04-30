import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  Navbar,
  DropdownButton,
  MenuItem,
  Button,
  Image,
} from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { bindComplexActionCreators } from 'rrmb-generator-utils';

import CityFilter from '../components/common/CityFilter';
import { allActions as commonActions } from '../modules/common-module';
import { handleError } from '../modules/handle-error-module';
import {allActions as loginActions, complexActions as loginComplexActions } from '../modules/login-module';

import { getAvatar } from '../helpers/auth';
import MenuItems from '../components/MenuItems';
import constants from '../data/constants';

require('../index.scss');

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {
      navExpanded: false,
    };

    this.onCityChanged = this.onCityChanged.bind(this);
    this.setNavExpanded = this.setNavExpanded.bind(this);
    this.closeNav = this.closeNav.bind(this);
  }

  onCityChanged(ev) {
    let newCityValue =
      ev.target.value !== '*' ?
        parseInt(ev.target.value, 10) :
        ev.target.value;
    newCityValue = isNaN(newCityValue) ?
      '*' :
       newCityValue;
    this.props.actions.cityChanged(newCityValue);
  }

  setNavExpanded(expanded) {
    this.setState({ navExpanded: expanded });
  }

  closeNav() {
    this.setState({ navExpanded: false });
  }

  renderCitySelect() {
    if (this.props.selectedCity && this.props.isLogged && this.props.cities) {
      return (
        <CityFilter
          vertical={false}
          sm="4"
          className="headerCityFilter"
          onChange={this.onCityChanged}
          value={this.props.selectedCity}
        />
      );
    }
    return false;
  }

  render() {
    const { isLogged } = this.props;
    return (
      <div>
        <Navbar
          inverse
          fluid
          onToggle={this.setNavExpanded}
          expanded={this.state.navExpanded}
        >
          <Navbar.Header>
            <Navbar.Brand>
              <span className="width170 topp0 bottomp0">
                <Image
                  id="logo"
                  className="bottomp10 topp10 height50"
                  src={constants.common.logo[this.props.selectedCity]}
                />
              </span>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse className="rightp0">
            <MenuItems
              className={'visible-xs'}
              menuItems={constants.menuItems}
              location={this.props.location}
              router={this.props.router}
              user={this.props.user}
              onItemClick={this.closeNav}
            />{this.renderCitySelect()}
            <Navbar.Form pullLeft>
              {' '}
              {NODE_ENV !== 'production' &&
                <DropdownButton
                  bsStyle={
                  this.props.common.activeAPI !== 'api' ? 'warning' : 'danger'}
                  title={`Active API: ${this.props.common.activeAPI}`}
                  onSelect={api => this.props.actions.changeAPI(api)}
                  id="choose-api-dropdown"
                >
                  {_.map(constants.common.apis, ({name, id}) =>
                    <MenuItem key={id} eventKey={id}>{name}</MenuItem>)}
                </DropdownButton>
              }
            </Navbar.Form>
            {isLogged &&
              <Navbar.Form pullRight>
                {this.props.user.avatars &&
                  <Button
                    disabled
                    bsStyle={'primary'}
                    className={''}
                  >{getAvatar(this.props.user)}
                  </Button>
                }
                <Button
                  onClick={() => this.props.actions.logout()}
                  className={'left10'}
                >Logout</Button>
              </Navbar.Form>
            }
          </Navbar.Collapse>
        </Navbar>
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = state =>
  ({
    selectedCity: state.common.selectedCity,
    cities: state.common.cities,
    user: state.login.user,
    isLogged: state.login.isLogged,
    common: state.common,
  });

// mapDispatchToProps :: Dispatch -> {Action}
const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators(
      {
        ...loginActions,
        cityChanged: commonActions.cityChanged,

      },
      dispatch
    ),

    ...bindComplexActionCreators(
      loginComplexActions,
      dispatch
    ),

    changeAPI: (api) => {
      dispatch(commonActions.changeAPI(api));
    },

    handleError: (err) => {
      dispatch(handleError(err));
    },

  },

});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Root));

import React, { Component, PropTypes } from 'react';
import cssModules from 'react-css-modules';
import {
  Modal,
  Button,
  ButtonToolbar,
  ButtonGroup,
  Col,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
import styles from './OnboardingDetailModal.scss';
import User from '../User';

class OnboardingDetailModal extends Component {
  /* eslint-disable */
  // Props Types
  static propTypes = {
    type: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    serverResponse: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onChangeUser: PropTypes.func.isRequired,
    onChangePage: PropTypes.func.isRequired,
  }
  /* eslint-enable */

  // Default Props Value
  static defaultProps = {
    type: 'drivers',
    userID: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      keypress: [],
    };
    this.handleKeyDownEvent = (e) => {
      const currentFocues = document.activeElement;
      const isInput = currentFocues.className === 'form-control';
      if (isInput) return;
      if (e.key === 'H') this.props.onClose();
      if (e.key === 'B') this.onChangeUser('prev');
      if (e.key === 'N') this.onChangeUser('next');
    };
  }

  componentWillMount() {
    this.setData();
    document.addEventListener('keydown', this.handleKeyDownEvent);
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDownEvent);
  }

  onChangeUser(direction) {
    const {
      navigation: {
        isLastOnPage,
        isLast,
        isFirstOnPage,
        isFirst,
        userPageIndex,
      },
      serverResponse,
    } = this.state;
    const next = direction === 'next';
    const prev = direction === 'prev';

    const getNextPageOfUsers = isLastOnPage && !isLast && next;
    const getPrevPageOfUsers = isFirstOnPage && !isFirst && prev;

    const isFirstOrLastInCollection = (prev && isFirst) || (next && isLast);

    if (isFirstOrLastInCollection) return;

    if (direction === 'last' || direction === 'first') {
      this.props.onChangeUser({direction});
    }

    if (getNextPageOfUsers) {
      this.props.onChangePage({page: this.props.serverResponse.number + 1, direction: 'next'});
      return;
    }

    if (getPrevPageOfUsers) {
      this.props.onChangePage({page: this.props.serverResponse.number - 1, direction: 'prev'});
      return;
    }

    if (next) {
      const nextIndex = serverResponse.content[userPageIndex + 1];
      this.props.onChangeUser({selected: nextIndex});
    }

    if (prev) {
      const prevIndex = serverResponse.content[userPageIndex - 1];
      this.props.onChangeUser({selected: prevIndex});
    }
  }

  getUserIndex() {
    const userIndexOnPage =
      _.findIndex(this.state.serverResponse.content, {id: this.state.userID}) + 1;
    const page = this.state.serverResponse.number + 1;
    const userCountToPage = this.state.serverResponse.size * page;
    const userIndex = userCountToPage - (this.state.serverResponse.size - userIndexOnPage);
    return `${userIndex} of ${this.state.serverResponse.totalElements}`;
  }

  getNavigationObject({serverResponse, userID}) {
    const userPageIndex = _.findIndex(_.get(serverResponse, 'content'), {driverId: userID});

    const isFirstOnPage = userPageIndex === 0;
    const isFirst = _.get(serverResponse, 'firstPage') && isFirstOnPage;

    const isLastOnPage = _.get(serverResponse, 'numberOfElements') === userPageIndex + 1;
    const isLast = _.get(serverResponse, 'last') && isLastOnPage;

    const userIndexOnPage = userPageIndex + 1;
    const page = _.get(serverResponse, 'number') + 1;
    const userCountToPage = _.get(serverResponse, 'size') * page;
    const userIndex = userCountToPage - (_.get(serverResponse, 'size') - userIndexOnPage);
    return {
      isFirstOnPage,
      isFirst,
      isLastOnPage,
      isLast,
      userIndexOnPage,
      userCountToPage,
      userPageIndex,
      userIndex,
      page,
    };
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {show, serverResponse, type, user, onboarding} = props;
    const userID = _.get(user, 'driverId');
    const navigation = this.getNavigationObject({serverResponse, userID});

    this.setState({
      show,
      serverResponse,
      user,
      userID,
      type,
      navigation,
      onboarding,
    });
  }

  renderUserNavigation() {
    const { serverResponse, navigation} = this.state;
    return (
      <ButtonGroup>
        <Button
          bsSize="small"
          disabled={navigation.isFirst && navigation.isFirstOnPage}
          onClick={() => this.onChangeUser('first')}
        ><i className="fa fa-angle-double-left" aria-hidden="true" /></Button>
        <Button
          bsSize="small"
          disabled={navigation.isFirst && navigation.isFirstOnPage}
          onClick={() => this.onChangeUser('prev')}
        ><i className="fa fa-chevron-left" aria-hidden="true" /></Button>
        <Button
          bsSize="small"
          className="user-index"
        >{`${navigation.userIndex} of ${_.get(serverResponse, 'totalElements')}`}</Button>
        <Button
          bsSize="small"
          disabled={navigation.isLast && navigation.isLastOnPage}
          onClick={() => this.onChangeUser('next')}
        ><i className="fa fa-chevron-right" aria-hidden="true" /></Button>
        <Button
          bsSize="small"
          disabled={navigation.isLast && navigation.isLastOnPage}
          onClick={() => this.onChangeUser('last')}
        ><i className="fa fa-angle-double-right" aria-hidden="true" /></Button>
      </ButtonGroup>
    );
  }

  renderHeader() {
    const tooltip = (
      <div className="text-left hotkeys">
        <div className=""><strong>Hotkeys</strong></div>
        <div><kbd><kbd>Shift</kbd> + <kbd>H</kbd></kbd> Close Window</div>
        <div><kbd><kbd>Shift</kbd> + <kbd>{'N'}</kbd></kbd> Next User</div>
        <div><kbd><kbd>Shift</kbd> + <kbd>{'B'}</kbd></kbd> Previous User</div>
      </div>
    );
    return (
      <Col className="onboarding-detail-header">
        <h3>Onboarding Details</h3>
        <div className="pull-right topp10">
          <ButtonToolbar>
            {this.renderTooltip(tooltip, this.renderUserNavigation())}
            <Button bsSize="small" onClick={() => this.props.onClose(this.state.userHasChanged)}>Close</Button>
          </ButtonToolbar>
        </div>
      </Col>
    );
  }

  renderTooltip(tooltip, content) {
    return (
      <OverlayTrigger placement="bottom" overlay={<Tooltip id={_.uniqueId()}>{tooltip}</Tooltip>}>
        {content}
      </OverlayTrigger>
    );
  }

  render() {
    return (
      <Modal
        show={this.state.show}
        backdrop={'static'}
        dialogClassName="onboardingDetailModal"
        bsSize={'lg'}
      >
        <Modal.Header>
          <Modal.Title>{this.renderHeader()}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="clearfix">
          <User
            keepTabState
            loading={this.props.loading}
            user={this.props.userProps}
            common={this.props.common}
            actions={this.props.userActions}
            onUserChange={() => this.setState({userHasChanged: true})}
            key={this.state.userID}
            params={{type: this.state.type, userID: this.state.userID}}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

export default cssModules(OnboardingDetailModal, styles);

import React, { Component, PropTypes } from 'react';
import Picture from '../common/Picture';
import Loading from '../Loading';

class UserPicture extends Component { // eslint-disable-line react/prefer-stateless-function
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
    this.state = {};
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onChangePicture(fileData) {
    const newDocument = {
      driverId: this.state.user.id,
      driverPhotoType: 'PHOTO',
      fileData,
    };
    this.props.onChangeDocument(newDocument);
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user = {}, documents = []} = props;
    const state = {user, documents};
    state.picture = user.photoUrl;

    const photo = _.find(documents, {documentType: 'PHOTO'});

    if (photo) {
      state.picture = photo.documentUrl;
      state.complete = photo.complete;
    }

    if (user.type === 'RIDER') {
      state.picture = user.user.photoUrl;
    }

    this.setState(state);
  }

  renderUserPicture() {
    if (!_.isEmpty(this.state.user)) {
      return (
        <Picture
          noFrame
          key="user-picture"
          size={'custom'}
          name=""
          picture={this.state.picture}
          complete={this.state.complete}
          bsStyle={this.props.bsStyle}
          subPicture={
            <div className="text-center font14 bottom5">
              {this.props.showName ? <div style={{fontWeight: '600'}}>{this.state.user.fullName}</div> : null}
              <div>{`#${this.state.user.id}`}</div>
            </div>}
          notChangeAble={this.props.user.type === 'RIDER' || this.props.viewOnly}
          onChange={newPicture =>
            this.onChangePicture(newPicture)}
        />
      );
    }
    return <Loading loading height="185" />;
  }

  render() {
    return (
      <div className="user-picture">
        {this.renderUserPicture()}
      </div>
    );
  }
}

export default UserPicture;

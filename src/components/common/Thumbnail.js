import React, { Component, PropTypes } from 'react';
import {
  Button,
  Thumbnail as BootstrapThumbnail,
  ButtonGroup,
} from 'react-bootstrap';

export default class Thumbnail extends Component {

  // Props Types
  static propTypes = {
    imgSource: PropTypes.string,
    editable: PropTypes.bool,
  };

  // Default Props Value
  static defaultProps = {
    title: '',
    editable: true,
    className: '',
  };

  constructor(props) {
    super(props);

    this.state = {};

    this.onCancel = this.onCancel.bind(this);
    this.onBrowsePhoto = this.onBrowsePhoto.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onPhotoChange = this.onPhotoChange.bind(this);
  }

  onCancel() {
    const imgSource = this.state.imgSource;
    const photoData = this.state.photoData;
    if (this.props.onChange) {
      this.props.onChange({ imgSource, photoData });
    }
    this.setState({ imgTmpSource: null, tmpPhotoData: null, updatingPhoto: false });
  }

  onSelect() {
    const imgSource = this.state.imgTmpSource;
    const photoData = this.state.tmpPhotoData;
    if (this.props.onChange) {
      this.props.onChange({ imgSource, photoData });
    }
    this.setState({
      imgSource,
      photoData,
      imgTmpSource: null,
      tmpPhotoData: null,
      updatingPhoto: false,
    });
  }

  onBrowsePhoto(proxy, el, ev) {
    this.tncPhotoInput.dispatchEvent(new MouseEvent('click', ev));
  }

  onPhotoChange(e) {
    e.preventDefault();
    const photo = e.target.files[0];
    if (!photo) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (this.props.onChange) {
        this.props.onChange({ imgSource: reader.result, photoData: photo });
      }
      this.setState({ imgTmpSource: reader.result, tmpPhotoData: photo, updatingPhoto: true });
    };

    reader.readAsDataURL(photo);
    this.tncPhotoInput.value = null;
  }

  renderChangePhoto() {
    if (this.state.updatingPhoto) {
      return (
        <ButtonGroup justified className="top15">
          <Button href="#" onClick={this.onCancel}>Cancel</Button>
          <Button href="#" bsStyle="primary" onClick={this.onSelect}>
            Select
          </Button>
        </ButtonGroup>
      );
    }

    return (
      <p className="top15">
        <Button
          disabled={this.state.updatingPhoto}
          bsSize="small"
          bsStyle="primary"
          block
          onClick={this.onBrowsePhoto}
        >Change photo</Button>
      </p>
    );
  }

  render() {
    const { imgSource: propsImgSource, name, editable } = this.props;
    const { imgSource: stateImgSource, imgTmpSource } = this.state;
    const imgSource = imgTmpSource || stateImgSource || propsImgSource;
    return (
      <BootstrapThumbnail src={imgSource} alt={name} className="driverThumbnail">
        {editable &&
          <a href={imgSource} rel={'noopener'} target="_blank">
            {name}
          </a>
        }
        {editable && this.renderChangePhoto()}
        <div className="hidden-file" style={{display: 'none'}}>
          <input type="file" ref={(ref) => { this.tncPhotoInput = ref; }} accept="image/*" onChange={this.onPhotoChange} />
        </div>
        {this.props.children}
      </BootstrapThumbnail>
    );
  }

}

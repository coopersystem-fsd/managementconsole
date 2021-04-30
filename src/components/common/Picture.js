import React, { Component, PropTypes } from 'react';
import {
  Image,
  Button,
  ListGroup,
  FormGroup,
  ListGroupItem,
  ButtonToolbar,
  ButtonGroup,
  Row,
} from 'react-bootstrap';
import cssModules from 'react-css-modules';
import styles from './Picture.scss';

class Picture extends Component { // eslint-disable-line react/prefer-stateless-function
  /*eslint-disable */
  // Props Types
  static propTypes = {
    picture: PropTypes.string,
    className: PropTypes.string,
    name: PropTypes.string,
    documentId: PropTypes.string,
    loading: PropTypes.bool,
    order: PropTypes.number,
    onChange: PropTypes.func,
    notChangeAble: PropTypes.bool,
  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {};

    this.onCancel = this.onCancel.bind(this);
  }

  componentWillMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    this.setData(nextProps);
  }

  onChange() {
    this.setState({loading: true});
    this.props.onChange(this.state.newPicture, this.state.preview);
  }

  onCancel() {
    this.setState({preview: null, newPicture: null});
    this.fileInput.value = null;
  }

  onPictureChange(e) {
    const picture = [...e.target.files][0];
    const reader = new FileReader();

    reader.onload = () => {
      const preview = reader.result;
      this.fileInput.value = null;
      this.setState({preview, newPicture: picture});
    };

    if (picture) {
      reader.readAsDataURL(picture);
    }
  }

  setData(nextProps) {
    const props = nextProps || this.props;
    const {picture, className, name, documentId, order, size = 'small', complete} = props;
    const state = {
      picture,
      className,
      name,
      documentId,
      complete,
      fileInput: `picture-input-${name.replace(/\W/g, ' ').toLowerCase().split(' ').join('-')}`,
      order,
      size,
    };

    if (complete) {
      state.loading = false;
      state.picture = this.state.preview || picture;
      state.preview = null;
    }

    this.setState(state);
  }

  changePhoto() {
    // const fileInput = `#${this.state.fileInput}`;
    // debugger // eslint-disable-line
    // $(fileInput).trigger('click');
    this.fileInput.click();
  }

  renderPictureContent() {
    return (
      <FormGroup className="bottom0">
        <div className="picture-label">{this.state.name}</div>
        <div className="picture-wrapper">
          <div className="placeholder">
            {!this.state.picture && <i className="fa fa-picture-o" aria-hidden="true" />}
          </div>
          {(this.state.picture || this.state.preview) &&
            <a target="_blank" rel={'noopener'} href={this.state.preview || this.state.picture} className="image">
              <Image responsive src={this.state.preview || this.state.picture} className="bottom10" />
            </a>
          }
        </div>
        {this.state.preview && !this.state.loading &&
          <ButtonToolbar>
            <ButtonGroup justified bsSize="small">
              <Button
                disabled={this.state.loading}
                bsStyle="danger"
                href="#"
                onClick={this.onCancel}
              >Cancel</Button>
              <Button
                disabled={this.state.loading}
                bsStyle="primary"
                href="#"
                onClick={() => this.onChange()}
              >Save</Button>
            </ButtonGroup>
          </ButtonToolbar>
        }
        {!this.state.preview && !this.state.loading && !this.props.notChangeAble &&
          <Button disabled={this.state.loading} block bsStyle={this.props.bsStyle} bsSize={'small'} onClick={() => this.changePhoto()}>Change Photo</Button>
        }
        {this.state.loading &&
          <Button disabled={this.state.loading} block bsStyle={this.props.bsStyle} bsSize={'small'}>Saving...</Button>
        }
        {this.props.subPicture}
      </FormGroup>
    );
  }

  renderPicture() {
    if (this.props.noFrame) {
      return this.renderPictureContent();
    }
    return (
      <ListGroup>
        <ListGroupItem className="clearfix">
          {this.renderPictureContent()}
          <Row>{this.props.children}</Row>
        </ListGroupItem>
      </ListGroup>
    );
  }

  renderFileInput() {
    if (this.state.fileInput) {
      return (
        <div className="hidden-file">
          <input
            type="file"
            ref={(ref) => { this.fileInput = ref; }}
            accept="image/*"
            onChange={event => this.onPictureChange(event)}
          />
        </div>
      );
    }
    return false;
  }

  render() {
    return (
      <div className={`picture ${this.state.className ? this.state.className : ''} ${this.state.size ? this.state.size : ''}`} order={this.props.order}>
        {this.renderPicture()}
        {this.renderFileInput()}
      </div>
    );
  }
}

export default cssModules(Picture, styles);

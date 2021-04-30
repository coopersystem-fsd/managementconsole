import React, {Component} from 'react';
import {Button, SplitButton, MenuItem} from 'react-bootstrap';


const EditModeButton = class EditModeButton extends Component {


  /*eslint-disable */
  // Props Types
  static propTypes = {

  }
  /*eslint-enable */

  // Default Props Value
  static defaultProps = {
  };


  render() {
    const button = <Button bsStyle="primary" onClick={this.props.onEdit}>Edit Mode</Button>;
    const splitButton = (<SplitButton id="editModeButton" bsStyle="success" onClick={this.props.onSave} title="Save">
      <MenuItem onClick={this.props.onCancel}>Cancel Edition</MenuItem>
    </SplitButton>);
    return !this.props.editMode ? button : splitButton;
  }

};


export default EditModeButton;

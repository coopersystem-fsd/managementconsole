import React from 'react';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import Loading from '../Loading';

export default ({ firstName, middleName, lastName, dateOfBirth, loading }) => {
  if (loading) return <Loading loading height="200px" />;

  return (
    <div>
      <FormGroup controlId="formControlsSelect" bsSize="small" className="bottom5">
        <ControlLabel>First name</ControlLabel>
        <FormControl componentClass="text" placeholder="First name" disabled>
          {firstName}
        </FormControl>
      </FormGroup>
      <FormGroup controlId="formControlsSelect" bsSize="small" className="bottom5">
        <ControlLabel>Middle name</ControlLabel>
        <FormControl componentClass="text" placeholder="Middle name" disabled>
          {middleName}
        </FormControl>
      </FormGroup>
      <FormGroup controlId="formControlsSelect" bsSize="small" className="bottom5">
        <ControlLabel>Last name</ControlLabel>
        <FormControl componentClass="text" placeholder="Last name" disabled>
          {lastName}
        </FormControl>
      </FormGroup>
      <FormGroup controlId="formControlsSelect" bsSize="small" className="bottom5">
        <ControlLabel>Date of birth</ControlLabel>
        <FormControl componentClass="text" placeholder="Date of birth" disabled>
          {dateOfBirth}
        </FormControl>
      </FormGroup>
    </div>
  );
};

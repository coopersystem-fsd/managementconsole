import React from 'react';
import {
  ListGroupItem,
  ListGroup,
} from 'react-bootstrap';
import './Box.scss';

export default props =>
(
  <ListGroup>
    <ListGroupItem className={`clearfix box ${props.className ? props.className : ''}`}>
      {props.title && <span className="box-title">{props.title}</span>}
      {props.children}
    </ListGroupItem>
  </ListGroup>
);

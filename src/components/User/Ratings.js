import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Rater from 'react-rater';
import {
  Label,
  ListGroup,
  ControlLabel,
  FormGroup,
  Col,
  ListGroupItem,
  Button,
} from 'react-bootstrap';

class Ratings extends Component { // eslint-disable-line react/prefer-stateless-function
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

  setData(nextProps) {
    const props = nextProps || this.props;
    const {user} = props;
    const state = {user};

    if ((!nextProps && this.props.user.id) || props.user.id !== this.props.user.id) {
      if (this.props.user.type === 'DRIVER') {
        this.props.actions.getDriversRatings(this.props.user.id);
      } else {
        this.props.actions.getRidersRatings(this.props.user.id);
      }
    }

    this.setState(state);
  }

  updateRating(id, rating, type) {
    this.props.actions.updateRating(id, rating);
    this.props.actions.recalculateRating(this.props.user.id, type);
    this.setData();
  }

  deleteRating(id, type) {
    this.props.actions.deleteRating(id);
    this.props.actions.recalculateRating(this.props.user.id, type);
    this.setData();
  }

  renderListItems(user) {
    const comments = (user.type === 'DRIVER') ? this.props.ratings.drivers.for[this.props.user.id] : this.props.ratings.riders.for[this.props.user.id];
    if (!comments) return false;
    if (!comments.length) {
      const type = (user.type === 'DRIVER') ? 'Driver' : 'Rider';
      return (
        <ListGroupItem bsStyle="warning">{type} not rated yet</ListGroupItem>
      );
    }

    return _.chain(comments).map((el) => {
      const name = el.ratedByFullName;
      const userID = el.ratedById;
      const rideID = el.rideId;
      const rating = el.rating;
      const date = el.updatedDate;
      const comment = el.comment;
      const ratingId = el.id;
      const commentStyle = {
        maxWidth: '555px',
        maxHeight: '50px',
        wordWrap: 'break-word',
        overflow: 'auto',
      };
      return (
        <ListGroupItem className="ratingsListGroup" key={ratingId}>
          <FormGroup style={{flex: 1}} className="bottom0">
            <Link to={`/profile/riders/${userID}`}>{name}</Link>
            <div style={commentStyle}>{comment}</div>
          </FormGroup>
          <FormGroup className="ratingsFormGroup bottom0">
            <ControlLabel>Ride: </ControlLabel>
            <Link to={`/ride/${rideID}`}>{` ${rideID}`}</Link>
          </FormGroup>
          <Rater
            total={5}
            interactive
            rating={rating}
            onRate={(r) => {
              if (r.originalEvent.type === 'click') {
                this.updateRating(ratingId, r.rating, user.type);
              }
            }}
          />
          <Label style={{ marginLeft: 15, marginRight: 15 }}>{date}</Label>
          <FormGroup className="ratingsFormGroup bottom0">
            <Button block bsStyle={'danger'} onClick={() => { this.deleteRating(ratingId, user.type); }}>Delete</Button>
          </FormGroup>
        </ListGroupItem>
      );
    }).reverse().value();
  }

  render() {
    return (
      <div>
        <Col style={{marginBottom: '10px'}}>Average Driver Rating: <b>{_.get(this.props.user, 'rating')}</b></Col>
        <ListGroup style={{overflow: 'auto', height: '350px', marginBottom: 0}}>{this.renderListItems(this.props.user)}</ListGroup>
      </div>
    );
  }
}

export default Ratings;

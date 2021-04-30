import React, { Component, PropTypes } from 'react';
import {
  Row,
  FormControl,
  ControlLabel,
  FormGroup,
  Thumbnail,
  ButtonGroup,
  Button,
} from 'react-bootstrap';
import Loader from 'react-loader';
import FormField from '../common/FormField';
import constants from '../../data/constants';

class TNCDocument extends Component {

  // Props Types
  static propTypes = {
    cityId: PropTypes.number,
    name: PropTypes.string,
  }

  // Default Props Value
  static defaultProps = {
    data: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      processing: false,
      tempValue: {},
    };

    this.onDelete = this.onDelete.bind(this);
  }

  onSave(newValue) {
    const {documentStatus, name, cityId, documentUrl, validityDate, id, cities} = this.props;
    const city = _.find(cities, {name: cityId});
    const documentObject = Object.assign({}, {
      documentId: id,
      id,
      documentType: 'TNC_CARD',
      cityId: city.id,
      documentStatus,
      documentUrl,
      name,
      validityDate,
    }, newValue);
    this.setState({tempValue: newValue});
    this.props.onSave(documentObject)
      .then(() => {
        setTimeout(() => {
          this.setState({tempValue: {}});
        }, 1000);
      }
    );
  }

  onDelete() {
    if (!this.props.onDelete) {
      return;
    }

    this.props.onDelete().then(() => {
      this.setState({
        processing: false,
      });
    });
    this.setState({
      processing: true,
    });
  }

  render() {
    const {documentStatus, name, cityId, documentUrl, validityDate} = this.props;
    const city = _.find(constants.common.cities.slice(), {id: cityId});
    return (<div style={{padding: 15}}>
      <Thumbnail
        src={documentUrl}
        alt={name}
        className="driverThumbnail"
      >
        <a
          href={documentUrl}
          rel={'noopener'}
          target="_blank"
          style={{overflow: 'hidden', whiteSpace: 'nowrap'}}
        >{name}</a>
        <ButtonGroup justified className="top15">
          <Button href="#" bsStyle="warning" onClick={this.onDelete} disabled={this.state.processing}>
            Delete
          </Button>
        </ButtonGroup>
      </Thumbnail>
      <Row>
        <FormField
          field={{
            name: 'Status',
            type: 'select',
            value: this.state.tempValue.documentStatus || documentStatus,
            allValues: constants.common.TNC_status.slice(),
          }}
          onChange={d => this.onSave({documentStatus: d})}
        />
      </Row>
      <FormGroup controlId="formControlsSelect">
        <ControlLabel>Expiry Date</ControlLabel>
        <FormControl componentClass="text" placeholder="Status" disabled>
          {validityDate ? moment(validityDate).format('YYYY-MM-DD') : 'N/A'}
        </FormControl>
      </FormGroup>
      <FormGroup controlId="formControlsSelect">
        <ControlLabel>City</ControlLabel>
        <FormControl componentClass="text" placeholder="Name" disabled>
          {city ? city.name : cityId}
        </FormControl>
      </FormGroup>
      <Loader loaded={!this.state.processing} />
    </div>);
  }

}

export default TNCDocument;

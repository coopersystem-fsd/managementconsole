import React, { Component, PropTypes } from 'react';
import { Col, Row } from 'react-bootstrap';
import TNCDocument from './TNCDcoument';

class TNCList extends Component { // eslint-disable-line react/prefer-stateless-function

  // Props Types
  static propTypes = {
    data: PropTypes.array,
    sm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  // Default Props Value
  static defaultProps = {
    sm: 3,
    data: [],
  };

  renderDocument(el) {
    const cities = this.props.cities;
    const city = cities.filter(({id}) => id === el.cityId)[0];
    return (<Col sm={this.props.sm}>
      <TNCDocument
        cities={this.props.cities}
        cityId={city.name}
        documentStatus={el.documentStatus}
        documentUrl={el.documentUrl}
        validityDate={el.validityDate}
        onEdit={ev => this.props.onEdit(ev, el)}
        id={el.id}
        onDelete={ev => this.props.onDelete(ev, el)}
        name={el.name}
        onSave={this.props.onSave}
      />
    </Col>);
  }

  render() {
    const data = this.props.data;
    if (!data || !data.length) {
      return null;
    }

    return <Row>{ data.map(TNCCard => this.renderDocument(TNCCard)) }</Row>;
  }
}

export default TNCList;

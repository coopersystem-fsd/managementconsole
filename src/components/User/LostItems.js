import React, { Component, PropTypes } from 'react';
import {
  Col,
  Table,
  ListGroupItem,
  ListGroup,
} from 'react-bootstrap';

class LostItems extends Component {


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
    this.state = {
      sortable: [
        { name: 'Type', property: 'type', sort: false },
        { name: 'Content', property: 'content', sort: false },
        { name: 'Created On', property: 'createdOn', sort: false },
      ],
    };
  }


  setTable(lostItems) {
    return _.map(lostItems, (row) => {
      const dateFormat = 'YYYY-MM-DD HH:mm';
      const mappedRow = {};
      _.forEach(this.state.sortable, ({property}) => { mappedRow[property] = row[property]; });
      mappedRow.createdOn =
        mappedRow.createdOn ? moment(row.createdOn).format(dateFormat) : null;
      return mappedRow;
    });
  }

  renderTable() {
    if (this.props.lostItems && this.props.lostItems.length > 0) {
      return (
        <div className="table-responsive responsive-mobile">
          <Table striped bordered condensed hover>
            <thead><tr>{_.map(this.state.sortable, f =>
              <th key={_.uniqueId()}>{f.name}</th>)}</tr></thead>
            <tbody>{_.map(this.setTable(this.props.lostItems), row =>
              <tr key={_.uniqueId()}>{_.map(row, v =>
                <td key={_.uniqueId()}>{v}</td>)}</tr>)}</tbody>
          </Table>
        </div>
    ); }
    return (<h4>No Lost Items were found for this user</h4>);
  }


  renderLostItems() {
    return (
      <ListGroup>
        <ListGroupItem className="clearfix">
          <strong><small>Lost And Found Items</small></strong>

          <div className="checkr">
            {this.renderTable()}
          </div>

        </ListGroupItem>
      </ListGroup>
    );
  }


  render() {
    return (<div className="background">
      <Col sm={12}>
        {this.renderLostItems()}
      </Col>
    </div>);
  }

}


export default LostItems;

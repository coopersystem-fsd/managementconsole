import React, {Component} from 'react';
import {
  Col,
  ListGroup,
  ListGroupItem,
  Button,
} from 'react-bootstrap';
import PaginatedTable from '../PaginatedTable';

class Campaigns extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sortable: [
        {name: 'Campaign', property: 'name', sort: false},
        {name: 'Actions', property: 'actions', sort: false},
      ],
      campaigns: props.campaigns,
    };
  }

  reloadRows() {
    this.props.actions.getCampaigns(this.props.user.id)
      .then((data) => {
        if (!data.error) {
          this.setState({campaigns: data.payload, reloadedCampaigns: false});
          if (!this.state.reloadedCampaigns) {
            this.mapCampaigns();
          }
        }
      });
  }

  mapCampaigns() {
    return _.map(this.state.campaigns, (row) => {
      const mappedRow = Object.assign({}, row);
      mappedRow.name = row.name;
      mappedRow.actions = row.subscribed ? (
        <Button
          bsSize="xsmall"
          onClick={() => {
            this.props.actions.unsubscribe(row.id, this.props.user.id)
              .then((data) => {
                if (!data.error) {
                  this.setState({reloadedCampaigns: true}, this.reloadRows);
                }
              });
          }}
        >Unsubscribe</Button>
      ) : (
        <Button
          bsSize="xsmall"
          onClick={() => {
            this.props.actions.subscribe(row.id, this.props.user.id)
              .then((data) => {
                if (!data.error) {
                  this.setState({reloadedCampaigns: true}, this.reloadRows);
                }
              });
          }}
        >Subscribe</Button>
      );
      return this.table.tableConfig.getDataMap(mappedRow);
    });
  }

  renderTable() {
    if (this.state.campaigns && this.state.campaigns.length > 0) {
      return (
        <PaginatedTable
          ref={(ref) => {
            this.table = ref;
          }}
          data={this.table ? this.mapCampaigns() : []}
          sortable={this.state.sortable}
        />
      );
    }
    return (<h4>No campaigns available</h4>);
  }

  renderCampaigns() {
    return (
      <ListGroup>
        <ListGroupItem className="clearfix">

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
        {this.renderCampaigns()}
      </Col>
    </div>);
  }
}

export default Campaigns;

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Label } from 'react-bootstrap';
import { Table, Tr, Td } from '../lib/reactable';

import endpointTest, {tests} from '../helpers/endpoint-test';

// mapStateToProps :: {State} -> {Props}
const mapStateToProps = state => ({
  common: state.common,
  login: state.login,
  testEndpoint: state.testEndpoint,
});

class EndpointTest extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    endpointTest(tests.slice(), () => {});
  }

  renderResults() {
    return (
      <Table className="table" sortable>
        {_.map(this.props.testEndpoint.results, ({
          seconds,
          url,
          status,
          page,
        }) =>
          <Tr>
            <Td column="Seconds">{`${seconds} s`}</Td>
            <Td column="Page">{page}</Td>
            <Td column="Status">
              <Label bsStyle={status === 200 ? 'success' : 'danger'}>
                {status}
              </Label>
            </Td>
            <Td column="Url">{url}</Td>
          </Tr>
        )}
      </Table>
    );
  }

  render() {
    return (
      <div>
        <h4>Tests run: {this.props.testEndpoint.results.length} / {tests.length}</h4>
        {this.renderResults()}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
)(EndpointTest);

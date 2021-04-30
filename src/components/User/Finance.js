import React, { Component, PropTypes } from 'react';
import { Form } from 'react-bootstrap';
import FormField from '../common/FormField';
import constants from '../../data/constants';

require('react-datepicker/dist/react-datepicker.css');

class Finance extends Component { // eslint-disable-line react/prefer-stateless-function
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

    this.setState(state);
  }

  clearKeypressString() {
    this.setState({keystring: ''});
  }

  mapFields(user) {
    return _.map(constants.user.finance, (field) => {
      field.value = user[field.id] || '';
      return field;
    });
  }

  renderField(field) {
    return (
      <FormField
        key={`finance-${field.id}`}
        field={field}
        order={field.order}
        onChange={() => {}}
      />
    );
  }

  render() {
    return (
      <div className="finance">
        <Form horizontal>
          {_.map(this.mapFields(this.state.user), field => this.renderField(field))}
        </Form>
      </div>
    );
  }
}

export default Finance;

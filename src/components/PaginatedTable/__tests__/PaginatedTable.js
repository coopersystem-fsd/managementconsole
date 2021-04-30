import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';
import PaginatedTable from '../';

describe('<PaginatedTable />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <PaginatedTable />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});

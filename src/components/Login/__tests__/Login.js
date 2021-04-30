import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';

import Login from '../';

describe('<Login />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Login />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});

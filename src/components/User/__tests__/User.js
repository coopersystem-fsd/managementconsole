import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';
import User from '../';

describe('<User />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <User />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});

import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import React from 'react';
import ForgetPassword from '../';

describe('<ForgetPassword />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <ForgetPassword />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});

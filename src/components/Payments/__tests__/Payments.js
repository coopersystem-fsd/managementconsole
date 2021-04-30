import { shallow } from 'enzyme'; // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json'; // eslint-disable-line
import React from 'react';
import Payments from '../';

const props = {
  user: {},
  login: {},
};

describe('<Payments />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Payments {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});

import { shallow } from 'enzyme';  // eslint-disable-line
import { shallowToJson } from 'enzyme-to-json';  // eslint-disable-line
import React from 'react';
import Users from '../';

const props = {
  actions: {
    getDrivers: () => new Promise(resolve => resolve()),
  },
};

describe('<Users />', () => {
  it('should render with default props', () => {
    const wrapper = shallow(
      <Users {...props} />
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
